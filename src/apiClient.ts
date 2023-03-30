import fetch, { Request, Response } from 'node-fetch';
import { ZodType } from 'zod';
import { NylasConfig, OverridableNylasConfig } from './config';
import { NylasApiError, NylasAuthError } from './schema/error';
import {
  AuthErrorResponseSchema,
  ErrorResponseSchema,
} from './schema/response';
import { objKeysToCamelCase, objKeysToSnakeCase } from './utils';
// import { AppendOptions } from 'form-data';

const PACKAGE_JSON = require('../package.json');
const SDK_VERSION = PACKAGE_JSON.version;

// TODO: refactor for new apiclient
export interface RequestOptionsParams {
  path: string;
  method: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  body?: any;
  overrides?: OverridableNylasConfig;
  // json?: boolean;
  // formData?: Record<string, FormDataType>;
}

interface OptionsPassthru<D extends ZodType> {
  responseSchema: D;
}

interface RequestOptions {
  path: string;
  method: string;
  headers: Record<string, string>;
  url: URL;
  body?: string;
  overrides?: Partial<NylasConfig>;
}

// export type FormDataType = {
//   value: unknown;
//   options?: Record<string, unknown> | AppendOptions;
// };

export default class APIClient {
  apiKey: string;
  serverUrl: string;
  clientId?: string;
  clientSecret?: string;

  constructor({ apiKey, serverUrl, clientId, clientSecret }: NylasConfig) {
    this.apiKey = apiKey;
    this.serverUrl = serverUrl as string; // TODO: get rid of type assertion
    this.clientSecret = clientSecret;
    this.clientId = clientId;
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
      const snakeCaseParams = objKeysToSnakeCase(queryParams);
      // TODO: refactor this not manually turn params into query string
      for (const [key, value] of Object.entries(snakeCaseParams)) {
        if (key == 'metadata_pair') {
          // The API understands a metadata_pair filter in the form of:
          // <key>:<value>
          for (const item in value as Record<string, string>) {
            url.searchParams.set(
              'metadata_pair',
              `${item}:${(value as Record<string, string>)[item]}`
            );
          }
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
    // logic for setting request body if is formdata
    // if (options.formData) {
    //   const fd = new FormData();
    //   for (const [key, obj] of Object.entries(options.formData)) {
    //     if (obj.options) {
    //       fd.append(key, obj.value, obj.options);
    //     } else {
    //       fd.append(key, obj.value);
    //     }
    //   }
    //   options.body = fd;
    //   options.headers['Content-Type'] = 'multipart/form-data';
    // } else

    // TODO: function to set request body
    // TODO: convert to snake case
    if (optionParams.body) {
      requestOptions.body = JSON.stringify(optionParams.body);
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

  // response has to be 204
  async requestWithEmptyReturn(status: number): Promise<undefined> {
    if (status === 204) {
      return undefined;
    }

    throw new Error(`unexpected response, status: ${status}`);
  }

  async requestWithResponse<T>(
    response: Response,
    passthru: OptionsPassthru<ZodType<T>>
  ): Promise<T> {
    const text = await response.text();

    const responseJSON = JSON.parse(text);

    // TODO: exclusion list for keys that should not be camelCased
    const camelCaseRes = objKeysToCamelCase(responseJSON);

    const testResponse = passthru.responseSchema.safeParse(camelCaseRes);
    if (testResponse.success) {
      return testResponse.data;
    }

    throw new Error('Could not validate response from the server.');
  }

  async request(options: RequestOptionsParams): Promise<undefined>;
  async request<T>(
    options: RequestOptionsParams,
    passthru: OptionsPassthru<ZodType<T>>
  ): Promise<T>;
  async request<T>(
    options: RequestOptionsParams,
    passthru?: OptionsPassthru<ZodType<T>>
  ): Promise<T | undefined> {
    const req = this.newRequest(options);

    const response = await fetch(req);

    if (typeof response === 'undefined') {
      throw new Error('Failed to fetch response');
    }

    // handle error response
    if (response.status > 299) {
      const text = await response.text();
      const error = JSON.parse(text);

      const authErrorResponse =
        options.path.includes('connect/token') ||
        options.path.includes('connect/revoke');

      if (authErrorResponse) {
        const testResponse = AuthErrorResponseSchema.safeParse(error);
        if (testResponse.success) {
          throw new NylasAuthError(testResponse.data);
        }
      } else {
        const testErrorResponse = ErrorResponseSchema.safeParse(error);
        if (testErrorResponse.success) {
          throw new NylasApiError(testErrorResponse.data);
        }
      }

      throw new Error(
        `received an error but could not validate error response from server: ${error}`
      );
    }

    if (!passthru) {
      return this.requestWithEmptyReturn(response.status);
    }

    return this.requestWithResponse(response, passthru);
  }
}
