import fetch, { Request, Response } from 'node-fetch';
import { NylasConfig, OverridableNylasConfig } from './config';
import {
  NylasApiError,
  NylasOAuthError,
  NylasSdkTimeoutError,
} from './models/error';
import { objKeysToCamelCase, objKeysToSnakeCase } from './utils';
import PACKAGE_JSON from '../package.json';

const SDK_VERSION = PACKAGE_JSON.version;

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
  body?: string;
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

  constructor({ apiKey, serverUrl, timeout }: Required<NylasConfig>) {
    this.apiKey = apiKey;
    this.serverUrl = serverUrl;
    this.timeout = timeout * 1000; // fetch timeout uses milliseconds
  }

  private setRequestUrl({
    overrides,
    path,
    queryParams,
  }: RequestOptionsParams): URL {
    const url = new URL(`${overrides?.serverUrl || this.serverUrl}${path}`);

    return this.setQueryStrings(url, queryParams);
  }

  private setQueryStrings(
    url: URL,
    queryParams?: Record<string, unknown>
  ): URL {
    if (queryParams) {
      const snakeCaseParams = objKeysToSnakeCase(queryParams, ['metadataPair']);
      // TODO: refactor this not manually turn params into query string
      for (const [key, value] of Object.entries(snakeCaseParams)) {
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
        } else {
          url.searchParams.set(key, value as string);
        }
      }
    }

    return url;
  }

  private setRequestHeaders({
    headers,
    overrides,
  }: RequestOptionsParams): Record<string, string> {
    return {
      Accept: 'application/json',
      'User-Agent': `Nylas Node SDK v${SDK_VERSION}`,
      Authorization: `Bearer ${overrides?.apiKey || this.apiKey}`,
      ...headers,
    };
  }

  requestOptions(optionParams: RequestOptionsParams): RequestOptions {
    const requestOptions = {} as RequestOptions;

    requestOptions.url = this.setRequestUrl(optionParams);
    requestOptions.headers = this.setRequestHeaders(optionParams);
    requestOptions.method = optionParams.method;

    if (optionParams.body) {
      requestOptions.body = JSON.stringify(
        objKeysToSnakeCase(optionParams.body)
      );
      requestOptions.headers['Content-Type'] = 'application/json';
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
      return objKeysToCamelCase(responseJSON);
    } catch (e) {
      throw new Error(`Could not parse response from the server: ${text}`);
    }
  }

  async request<T>(options: RequestOptionsParams): Promise<T> {
    const req = this.newRequest(options);
    const controller: AbortController = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      throw new NylasSdkTimeoutError(req.url, this.timeout);
    }, this.timeout);

    const response = await fetch(req, { signal: controller.signal });
    clearTimeout(timeout);

    if (typeof response === 'undefined') {
      throw new Error('Failed to fetch response');
    }

    // handle error response
    if (response.status > 299) {
      const authErrorResponse =
        options.path.includes('connect/token') ||
        options.path.includes('connect/revoke');

      const text = await response.text();
      let error: Error;
      try {
        const parsedError = JSON.parse(text);
        const camelCaseError = objKeysToCamelCase(parsedError);

        if (authErrorResponse) {
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

    return this.requestWithResponse(response);
  }
}
