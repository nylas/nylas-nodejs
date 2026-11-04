import { NylasConfig, OverridableNylasConfig } from './config.js';
import {
  NylasApiError,
  NylasOAuthError,
  NylasSdkTimeoutError,
} from './models/error.js';
import { objKeysToCamelCase, objKeysToSnakeCase } from './utils.js';
import { SDK_VERSION } from './version.js';
import { FormData } from 'formdata-node';
import { FormDataEncoder } from 'form-data-encoder';
import { Readable } from 'node:stream';
import { snakeCase } from 'change-case';

/**
 * The header key for the debugging flow ID
 */
export const FLOW_ID_HEADER = 'x-fastly-id';
/**
 * The header key for the request ID
 */
export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Options for a request to the Nylas API
 * @property path The path to the API endpoint
 * @property method The HTTP method to use
 * @property headers Additional headers to send with the request
 * @property queryParams Query parameters to send with the request
 * @property body The body of the request
 * @property overrides Overrides to the default Nylas API client configuration
 * @ignore Not for public use
 */
export interface RequestOptionsParams {
  path: string;
  method: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  body?: any;
  serializedBody?: string | Buffer;
  form?: FormData;
  overrides?: OverridableNylasConfig;
}

/**
 * Options for building a request for fetch to understand
 * @property path The path to the API endpoint
 * @property method The HTTP method to use
 * @property headers Additional headers to send with the request
 * @property url The URL of the request
 * @property body The body of the request
 * @property overrides Overrides to the default Nylas API client configuration
 * @ignore Not for public use
 */
interface RequestOptions {
  path: string;
  method: string;
  headers: Record<string, string>;
  url: URL;
  body?: any;
  overrides?: Partial<NylasConfig>;
  duplex?: 'half';
}

/**
 * The API client for communicating with the Nylas API
 * @ignore Not for public use
 */
export default class APIClient {
  /**
   * The API key to use for authentication
   */
  apiKey: string;
  /**
   * The URL to use for communicating with the Nylas API
   */
  serverUrl: string;
  /**
   * The timeout for requests to the Nylas API, in seconds
   */
  timeout: number;
  /**
   * Additional headers to send with outgoing requests
   */
  headers: Record<string, string>;

  constructor({ apiKey, apiUri, timeout, headers }: Required<NylasConfig>) {
    this.apiKey = apiKey;
    this.serverUrl = apiUri;
    this.timeout = timeout * 1000; // fetch timeout uses milliseconds
    this.headers = headers;
  }

  private setRequestUrl({
    overrides,
    path,
    queryParams,
  }: RequestOptionsParams): URL {
    const url = new URL(`${overrides?.apiUri || this.serverUrl}${path}`);

    return this.setQueryStrings(url, queryParams);
  }

  private setQueryStrings(
    url: URL,
    queryParams?: Record<string, unknown>
  ): URL {
    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        const snakeCaseKey = snakeCase(key);
        if (key == 'metadataPair') {
          // The API understands a metadata_pair filter in the form of:
          // <key>:<value>
          const metadataPair: string[] = [];
          for (const item in value as Record<string, string>) {
            metadataPair.push(
              `${item}:${(value as Record<string, string>)[item]}`
            );
          }
          url.searchParams.set('metadata_pair', metadataPair.join(','));
        } else if (Array.isArray(value)) {
          for (const item of value) {
            url.searchParams.append(snakeCaseKey, item as string);
          }
        } else if (typeof value === 'object') {
          for (const item in value) {
            url.searchParams.append(
              snakeCaseKey,
              `${item}:${(value as Record<string, string>)[item]}`
            );
          }
        } else {
          url.searchParams.set(snakeCaseKey, value as string);
        }
      }
    }

    return url;
  }

  private setRequestHeaders({
    headers,
    overrides,
  }: RequestOptionsParams): Record<string, string> {
    const mergedHeaders: Record<string, string> = {
      ...headers,
      ...this.headers,
      ...overrides?.headers,
    };

    const defaultHeaders: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': `Nylas Node SDK v${SDK_VERSION}`,
      ...mergedHeaders,
    };

    if (!overrides?.skipAuth) {
      defaultHeaders.Authorization = `Bearer ${overrides?.apiKey || this.apiKey}`;
    }

    return defaultHeaders;
  }

  private async sendRequest<T>(
    options: RequestOptionsParams,
    readResponse: (response: Response) => Promise<T>
  ): Promise<T> {
    const req = await this.newRequest(options);
    const controller: AbortController = new AbortController();

    // Handle timeout
    let timeoutDuration: number;
    if (options.overrides?.timeout) {
      // Determine if the override timeout is likely in milliseconds (≥ 1000)
      if (options.overrides.timeout >= 1000) {
        timeoutDuration = options.overrides.timeout; // Keep as milliseconds for backward compatibility
      } else {
        // Treat as seconds and convert to milliseconds
        timeoutDuration = options.overrides.timeout * 1000;
      }
    } else {
      timeoutDuration = this.timeout; // Already in milliseconds from constructor
    }

    const timeout = setTimeout(() => {
      controller.abort();
    }, timeoutDuration);
    let responseHeaders: Record<string, string> = {};

    try {
      const response = await fetch(req, {
        signal: controller.signal as AbortSignal,
      });
      if (typeof response === 'undefined') {
        throw new Error('Failed to fetch response');
      }

      const headers = response?.headers?.entries
        ? Object.fromEntries(response.headers.entries())
        : {};
      const flowId = headers[FLOW_ID_HEADER];
      const requestId = headers[REQUEST_ID_HEADER];
      responseHeaders = headers;

      if (response.status > 299) {
        const text = await this.readResponseBody(response, () =>
          response.text()
        );
        let error: Error;
        try {
          const parsedError = JSON.parse(text);
          const camelCaseError = objKeysToCamelCase(parsedError);

          // Check if the request is an authentication request
          const isAuthRequest =
            options.path.includes('connect/token') ||
            options.path.includes('connect/revoke');

          if (isAuthRequest) {
            error = new NylasOAuthError(
              camelCaseError,
              response.status,
              requestId,
              flowId,
              headers
            );
          } else {
            error = new NylasApiError(
              camelCaseError,
              response.status,
              requestId,
              flowId,
              headers
            );
          }
        } catch {
          throw new Error(
            `Received an error but could not parse response from the server${
              flowId ? ` with flow ID ${flowId}` : ''
            }: ${text}`
          );
        }

        throw error;
      }

      return await readResponse(response);
    } catch (error) {
      if (
        controller.signal.aborted ||
        (error instanceof Error && error.name === 'AbortError')
      ) {
        throw new NylasSdkTimeoutError(
          req.url,
          timeoutDuration / 1000,
          responseHeaders[REQUEST_ID_HEADER],
          responseHeaders[FLOW_ID_HEADER],
          responseHeaders
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  requestOptions(optionParams: RequestOptionsParams): RequestOptions {
    const requestOptions = {} as RequestOptions;

    requestOptions.url = this.setRequestUrl(optionParams);
    requestOptions.headers = this.setRequestHeaders(optionParams);
    requestOptions.method = optionParams.method;

    if (optionParams.serializedBody) {
      requestOptions.body = optionParams.serializedBody;
      requestOptions.headers['Content-Type'] = 'application/json';
    } else if (optionParams.body) {
      requestOptions.body = JSON.stringify(
        objKeysToSnakeCase(optionParams.body, ['metadata']) // metadata should remain as is
      );
      requestOptions.headers['Content-Type'] = 'application/json';
    }

    if (optionParams.form) {
      // Use FormDataEncoder to properly encode the form data with the correct
      // Content-Type header including the multipart boundary.
      // This is required for Node.js environments where formdata-node's FormData
      // doesn't automatically set the Content-Type header on fetch requests.
      const encoder = new FormDataEncoder(optionParams.form);

      // Set the Content-Type header with the boundary from the encoder
      requestOptions.headers['Content-Type'] = encoder.contentType;

      // Convert the encoded form data to a readable stream for the request body
      requestOptions.body = Readable.from(encoder);

      // Node.js native fetch requires duplex: 'half' when sending a streaming body
      requestOptions.duplex = 'half';
    }

    return requestOptions;
  }

  async newRequest(options: RequestOptionsParams): Promise<Request> {
    const newOptions = this.requestOptions(options);
    const requestInit: RequestInit = {
      method: newOptions.method,
      headers: newOptions.headers,
      body: newOptions.body,
    };

    // Add duplex option for streaming bodies (required by Node.js native fetch)
    if (newOptions.duplex) {
      (requestInit as any).duplex = newOptions.duplex;
    }

    return new Request(newOptions.url, requestInit);
  }

  private async readResponseBody<T>(
    response: Response,
    read: () => Promise<T>
  ): Promise<T> {
    try {
      return await read();
    } catch {
      const headers = response?.headers?.entries
        ? Object.fromEntries(response.headers.entries())
        : {};
      const requestId = headers[REQUEST_ID_HEADER];
      throw new NylasApiError(
        {
          requestId,
          error: {
            type: 'sdk.response_body_error',
            message: 'Failed to read response from the server.',
          },
        },
        response.status,
        requestId,
        headers[FLOW_ID_HEADER],
        headers
      );
    }
  }

  async requestWithResponse<T>(response: Response): Promise<T> {
    const headers = response?.headers?.entries
      ? Object.fromEntries(response.headers.entries())
      : {};
    const flowId = headers[FLOW_ID_HEADER];
    const text = await this.readResponseBody(response, () => response.text());

    try {
      const parsed = JSON.parse(text);
      const payload = objKeysToCamelCase(
        {
          ...parsed,
          flowId,
          // deprecated: headers will be removed in a future release. This is for backwards compatibility.
          headers,
        },
        ['metadata']
      );
      // Attach rawHeaders as a non-enumerable property to avoid breaking deep equality
      Object.defineProperty(payload, 'rawHeaders', {
        value: headers,
        enumerable: false,
      });
      return payload;
    } catch {
      throw new Error(`Could not parse response from the server: ${text}`);
    }
  }

  async request<T>(options: RequestOptionsParams): Promise<T> {
    return this.sendRequest(options, (response) =>
      this.requestWithResponse<T>(response)
    );
  }

  async requestRaw(options: RequestOptionsParams): Promise<Buffer> {
    return this.sendRequest(options, async (response) => {
      const arrayBuffer = await this.readResponseBody(response, () =>
        response.arrayBuffer()
      );
      return Buffer.from(arrayBuffer);
    });
  }

  async requestStream(
    options: RequestOptionsParams
  ): Promise<ReadableStream<Uint8Array>> {
    return this.sendRequest(options, async (response) => {
      if (!response.body) {
        throw new Error('No response body');
      }
      // The caller owns consumption and cancellation after the stream is returned.
      return response.body;
    });
  }
}
