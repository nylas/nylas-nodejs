import fetch, { Request } from 'node-fetch';
import { NylasConfig } from './config';

import FormData, { AppendOptions } from 'form-data';
import NylasApiError from './schema/error';

const PACKAGE_JSON = require('../package.json');
const SDK_VERSION = PACKAGE_JSON.version;
const SUPPORTED_API_VERSION = '2.5';

export enum AuthMethod {
  BASIC,
  BEARER,
}

export type RequestOptions = {
  path: string;
  method?: string;
  headers?: Record<string, string>;
  qs?: Record<string, unknown>;
  downloadRequest?: boolean;
  json?: boolean;
  formData?: Record<string, FormDataType>;
  body?: any;
  baseUrl?: string;
  url: URL;
  authMethod?: AuthMethod;
  overrides?: Partial<NylasConfig>;
};

export type FormDataType = {
  value: unknown;
  options?: Record<string, unknown> | AppendOptions;
};

export default class APIClient {
  apiKey: string;
  clientId?: string;
  clientSecret?: string;
  serverUrl: string;

  constructor({ apiKey, clientSecret, clientId, serverUrl }: NylasConfig) {
    this.apiKey = apiKey;
    this.clientSecret = clientSecret;
    this.clientId = clientId;
    this.serverUrl = serverUrl as string; // TODO: get rid of type assertion
  }

  requestOptions(options: RequestOptions): RequestOptions {
    const baseUrl = options.baseUrl || this.serverUrl;
    const url = new URL(`${baseUrl}${options.path}`);
    // map querystring to search params
    if (options.qs) {
      for (const [key, value] of Object.entries(options.qs)) {
        // For convenience, If `expanded` param is provided, convert to view:
        // 'expanded' api option
        if (key === 'expanded') {
          if (value === true) {
            url.searchParams.set('view', 'expanded');
          }
        } else if (key == 'metadata_pair') {
          // The API understands a metadata_pair filter in the form of:
          // <key>:<value>
          for (const item in value as Record<string, string>) {
            url.searchParams.set(
              'metadata_pair',
              `${item}:${(value as Record<string, string>)[item]}`
            );
          }
        } else if (Array.isArray(value)) {
          for (const item of value) {
            url.searchParams.append(key, item);
          }
        } else {
          url.searchParams.set(key, value as string);
        }
      }
    }
    options.url = url;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': `Nylas Node SDK v${SDK_VERSION}`,
      'Nylas-API-Version': SUPPORTED_API_VERSION,
      'Nylas-SDK-API-Version': SUPPORTED_API_VERSION,
      ...options.headers,
    };

    if (this.clientId != null) {
      headers['X-Nylas-Client-Id'] = this.clientId;
    }
    options.headers = headers;

    if (options.formData) {
      const fd = new FormData();
      for (const [key, obj] of Object.entries(options.formData)) {
        if (obj.options) {
          fd.append(key, obj.value, obj.options);
        } else {
          fd.append(key, obj.value);
        }
      }
      options.body = fd;
      headers['Content-Type'] = 'multipart/form-data';
    } else if (options.body && options.json !== false) {
      options.body = JSON.stringify(options.body);
      headers['Content-Type'] = 'application/json';
    }

    return options;
  }

  newRequest(options: RequestOptions): Request {
    const newOptions = this.requestOptions(options);

    return new Request(newOptions.url, {
      method: newOptions.method,
      headers: newOptions.headers,
      body: newOptions.body,
    });
  }

  request<T>(options: RequestOptions): Promise<T> {
    const req = this.newRequest(options);
    return new Promise<any>((resolve, reject) => {
      return fetch(req)
        .then(response => {
          if (typeof response === 'undefined') {
            return reject(new Error('No response'));
          }

          if (response.status > 299) {
            return response.text().then(body => {
              try {
                const error = new NylasApiError(JSON.parse(body));
                return reject(error);
              } catch (e) {
                return reject(e);
              }
            });
          } else {
            if (options.downloadRequest) {
              response
                .buffer()
                .then(buffer => {
                  // Return an object with the headers and the body as a buffer
                  const fileDetails: Record<string, any> = {};
                  response.headers.forEach((v, k) => {
                    fileDetails[k] = v;
                  });
                  fileDetails['body'] = buffer;
                  return resolve(fileDetails);
                })
                .catch(e => {
                  return reject(e);
                });
            } else if (
              response.headers.get('content-length') &&
              Number(response.headers.get('content-length')) == 0
            ) {
              return resolve(undefined);
            } else if (
              response.headers.get('Content-Type') === 'message/rfc822'
            ) {
              return resolve(response.text());
            } else {
              return response.text().then(text => {
                try {
                  return resolve(JSON.parse(text));
                } catch (e) {
                  return resolve(text);
                }
              });
            }
          }
        })
        .catch((err: Error) => {
          console.error(`Error encountered during request:\n${err.stack}`);
          return reject(err);
        });
    });
  }
}
