import fetch, { Request, Response } from 'node-fetch';
import { NylasConfig, OverridableNylasConfig } from './config.js';
import {
  NylasApiError,
  NylasOAuthError,
  NylasSdkTimeoutError,
} from './models/error.js';
import { objKeysToCamelCase, objKeysToSnakeCase } from './utils.js';
import { SDK_VERSION } from './version.js';
import FormData from 'form-data';
import { snakeCase } from 'change-case';

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
          url.searchParams.append(snakeCaseKey, value.join(','));
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

    return {
      Accept: 'application/json',
      'User-Agent': `Nylas Node SDK v${SDK_VERSION}`,
      Authorization: `Bearer ${overrides?.apiKey || this.apiKey}`,
      ...mergedHeaders,
    };
  }

  private async sendRequest(options: RequestOptionsParams): Promise<Response> {
    const req = this.newRequest(options);
    const controller: AbortController = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, this.timeout);

    try {
      const response = await fetch(req, { signal: controller.signal });
      clearTimeout(timeout);

      if (typeof response === 'undefined') {
        throw new Error('Failed to fetch response');
      }

      if (response.status > 299) {
        const text = await response.text();
        let error: Error;
        try {
          const parsedError = JSON.parse(text);
          const camelCaseError = objKeysToCamelCase(parsedError);

          // Check if the request is an authentication request
          const isAuthRequest =
            options.path.includes('connect/token') ||
            options.path.includes('connect/revoke');

          if (isAuthRequest) {
            error = new NylasOAuthError(camelCaseError, response.status);
          } else {
            error = new NylasApiError(camelCaseError, response.status);
          }
        } catch (e) {
          throw new Error(
            `Received an error but could not parse response from the server: ${text}`
          );
        }

        throw error;
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NylasSdkTimeoutError(req.url, this.timeout);
      }

      clearTimeout(timeout);
      throw error;
    }
  }

  requestOptions(optionParams: RequestOptionsParams): RequestOptions {
    const requestOptions = {} as RequestOptions;

    requestOptions.url = this.setRequestUrl(optionParams);
    requestOptions.headers = this.setRequestHeaders(optionParams);
    requestOptions.method = optionParams.method;

    if (optionParams.body) {
      requestOptions.body = JSON.stringify(
        objKeysToSnakeCase(optionParams.body, ['metadata']) // metadata should remain as is
      );
      requestOptions.headers['Content-Type'] = 'application/json';
    }

    if (optionParams.form) {
      requestOptions.body = optionParams.form;
      requestOptions.headers = {
        ...requestOptions.headers,
        ...optionParams.form.getHeaders(),
      };
    }

    return requestOptions;
  }

  newRequest(options: RequestOptionsParams): Request {
    const newOptions = this.requestOptions(options);
    return new Request(newOptions.url, {
      method: newOptions.method,
      headers: newOptions.headers,
      body: newOptions.body,
    });
  }

  async requestWithResponse<T>(response: Response): Promise<T> {
    const text = await response.text();

    try {
      const responseJSON = JSON.parse(text);
      return objKeysToCamelCase(responseJSON, ['metadata']);
    } catch (e) {
      throw new Error(`Could not parse response from the server: ${text}`);
    }
  }

  async request<T>(options: RequestOptionsParams): Promise<T> {
    const response = await this.sendRequest(options);
    return this.requestWithResponse(response);
  }

  async requestRaw(options: RequestOptionsParams): Promise<Buffer> {
    const response = await this.sendRequest(options);
    return response.buffer();
  }

  async requestStream(
    options: RequestOptionsParams
  ): Promise<NodeJS.ReadableStream> {
    const response = await this.sendRequest(options);
    return response.body;
  }
}
