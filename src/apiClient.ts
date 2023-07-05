import fetch, { Request, Response } from 'node-fetch';
import { NylasConfig, OverridableNylasConfig } from './config';
import {
  NylasApiError,
  NylasAuthError,
  NylasTokenValidationError,
} from './schema/error';

const PACKAGE_JSON = require('../package.json');
const SDK_VERSION = PACKAGE_JSON.version;

export interface RequestOptionsParams {
  path: string;
  method: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  body?: any;
  overrides?: OverridableNylasConfig;
}

interface RequestOptions {
  path: string;
  method: string;
  headers: Record<string, string>;
  url: URL;
  body?: string;
  overrides?: Partial<NylasConfig>;
}

export default class APIClient {
  apiKey: string;
  serverUrl: string;
  timeout: number; // TODO::Implement

  constructor({ apiKey, serverUrl, timeout }: Required<NylasConfig>) {
    this.apiKey = apiKey;
    this.serverUrl = serverUrl;
    this.timeout = timeout;
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
      // TODO: refactor this not manually turn params into query string
      for (const [key, value] of Object.entries(queryParams)) {
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
      requestOptions.body = optionParams.body
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
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Could not parse response from the server: ${text}`);
    }
  }

  async request<T>(options: RequestOptionsParams): Promise<T> {
    const req = this.newRequest(options);

    const response = await fetch(req);

    if (typeof response === 'undefined') {
      throw new Error('Failed to fetch response');
    }

    // handle error response
    if (response.status > 299) {
      const text = await response.text();
      let error;
      try {
        error = JSON.parse(text);
      } catch (e) {
        throw new Error(`Could not parse response from the server: ${text}`);
      }

      const authErrorResponse =
        options.path.includes('connect/token') ||
        options.path.includes('connect/revoke');

      const tokenErrorResponse = options.path.includes('connect/tokeninfo');
      if (authErrorResponse && !tokenErrorResponse) {
        throw new NylasAuthError(error);
      } else if (tokenErrorResponse) {
        throw new NylasTokenValidationError(error);
      } else {
        throw new NylasApiError(error);
      }
    }

    return this.requestWithResponse(response);
  }
}
