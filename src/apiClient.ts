import fetch, { Request } from 'node-fetch';
import { NylasConfig, OverridableNylasConfig } from './config';
import NylasApiError from './schema/error';
// import { AppendOptions } from 'form-data';

const PACKAGE_JSON = require('../package.json');
const SDK_VERSION = PACKAGE_JSON.version;

// TODO: refactor for new apiclient
export type RequestOptionsParams = {
  path: string;
  method: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, unknown>;
  body?: any;
  overrides?: OverridableNylasConfig;
  // json?: boolean;
  // formData?: Record<string, FormDataType>;
};

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
  // clientId?: string;
  // clientSecret?: string;

  constructor({ apiKey, serverUrl }: NylasConfig) {
    this.apiKey = apiKey;
    this.serverUrl = serverUrl as string; // TODO: get rid of type assertion
    // this.clientSecret = clientSecret;
    // this.clientId = clientId;
  }

  private setRequestUrl({
    overrides,
    path,
    queryParams: qs,
  }: RequestOptionsParams): URL {
    const url = new URL(`${overrides?.serverUrl || this.serverUrl}${path}`);

    // TODO: refactor this not manually turn params into query string
    // please put in separate function :)
    if (qs) {
      for (const [key, value] of Object.entries(qs)) {
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

  request<T>(options: RequestOptionsParams): Promise<T> {
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
            if (
              response.headers.get('content-length') &&
              Number(response.headers.get('content-length')) == 0
            ) {
              return resolve(undefined);
            } else {
              return response.text().then(text => {
                try {
                  // TODO: response validation here
                  // TODO: pass request_id
                  // TODO: convert everything to camelCase
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
