import fetch, { Request } from 'node-fetch';
import * as config from './config';
import RestfulModelCollection from './models/restful-model-collection';
import CalendarRestfulModelCollection from './models/calendar-restful-model-collection';
import ContactRestfulModelCollection from './models/contact-restful-model-collection';
import RestfulModelInstance from './models/restful-model-instance';
import Account from './models/account';
import Thread from './models/thread';
import Draft from './models/draft';
import File from './models/file';
import Event from './models/event';
import Resource from './models/resource';
import Folder, { Label } from './models/folder';
import FormData, { AppendOptions } from 'form-data';
import Neural from './models/neural';
import NylasApiError from './models/nylas-api-error';
import ComponentRestfulModelCollection from './models/component-restful-model-collection';
import SchedulerRestfulModelCollection from './models/scheduler-restful-model-collection';
import MessageRestfulModelCollection from './models/message-restful-model-collection';
import DeltaCollection from './models/delta-collection';
import Outbox from './models/outbox';
import JobStatusRestfulModelCollection from './models/job-status-restful-model-collection';
import RateLimitError from './models/rate-limit-error';

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
  url?: URL;
  authMethod?: AuthMethod;
};

export type FormDataType = {
  value: unknown;
  options?: Record<string, unknown> | AppendOptions;
};

export default class NylasConnection {
  accessToken: string | null | undefined;
  clientId: string | null | undefined;

  threads: RestfulModelCollection<Thread> = new RestfulModelCollection(
    Thread,
    this
  );
  contacts: ContactRestfulModelCollection = new ContactRestfulModelCollection(
    this
  );
  messages: MessageRestfulModelCollection = new MessageRestfulModelCollection(
    this
  );
  drafts: RestfulModelCollection<Draft> = new RestfulModelCollection(
    Draft,
    this
  );
  files: RestfulModelCollection<File> = new RestfulModelCollection(File, this);
  calendars: CalendarRestfulModelCollection = new CalendarRestfulModelCollection(
    this
  );
  jobStatuses: JobStatusRestfulModelCollection = new JobStatusRestfulModelCollection(
    this
  );
  events: RestfulModelCollection<Event> = new RestfulModelCollection(
    Event,
    this
  );
  resources: RestfulModelCollection<Resource> = new RestfulModelCollection(
    Resource,
    this
  );
  deltas = new DeltaCollection(this);
  labels: RestfulModelCollection<Label> = new RestfulModelCollection(
    Label,
    this
  );
  folders: RestfulModelCollection<Folder> = new RestfulModelCollection(
    Folder,
    this
  );
  account: RestfulModelInstance<Account> = new RestfulModelInstance(
    Account,
    this
  );
  component: ComponentRestfulModelCollection = new ComponentRestfulModelCollection(
    this
  );
  scheduler: SchedulerRestfulModelCollection = new SchedulerRestfulModelCollection(
    this
  );
  outbox: Outbox = new Outbox(this);
  neural: Neural = new Neural(this);

  constructor(
    accessToken: string | null | undefined,
    { clientId }: { clientId: string | null | undefined }
  ) {
    this.accessToken = accessToken;
    this.clientId = clientId;
  }

  requestOptions(options: RequestOptions): RequestOptions {
    const baseUrl = options.baseUrl ? options.baseUrl : config.apiServer;
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
      // 'Nylas-API-Version': SUPPORTED_API_VERSION,
      'Nylas-SDK-API-Version': SUPPORTED_API_VERSION,
      ...options.headers,
    };
    const user =
      options.path.substr(0, 3) === '/a/' || options.path.includes('/component')
        ? config.clientSecret
        : this.accessToken;

    if (user) {
      if (options.authMethod === AuthMethod.BEARER) {
        headers['authorization'] = `Bearer ${user}`;
      } else {
        headers['authorization'] =
          'Basic ' + Buffer.from(`${user}:`, 'utf8').toString('base64');
      }
    }

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

    return new Request(newOptions.url || '', {
      method: newOptions.method || 'GET',
      headers: newOptions.headers,
      body: newOptions.body,
    });
  }

  private getWarningForVersion(
    sdkApiVersion?: string,
    apiVersion?: string
  ): string {
    let warning = '';

    if (sdkApiVersion != apiVersion) {
      if (sdkApiVersion && apiVersion) {
        warning +=
          `WARNING: SDK version may not support your Nylas API version.` +
          ` SDK supports version ${sdkApiVersion} of the API and your application` +
          ` is currently running on version ${apiVersion} of the API.`;

        const apiNum = parseInt(apiVersion.split('-')[0]);
        const sdkNum = parseInt(sdkApiVersion.split('-')[0]);

        if (sdkNum > apiNum) {
          warning += ` Please update the version of the API that your application is using through the developer dashboard.`;
        } else if (apiNum > sdkNum) {
          warning += ` Please update the sdk to ensure it works properly.`;
        }
      }
    }
    return warning;
  }

  request(options: RequestOptions): Promise<any> {
    const req = this.newRequest(options);
    return new Promise<any>((resolve, reject) => {
      return fetch(req)
        .then(response => {
          if (typeof response === 'undefined') {
            return reject(new Error('No response'));
          }
          // COMMENTED BECAUSE WE NO LONGER NEED A HEADER CHECK HERE
          // node headers are lowercaser so this refers to `Nylas-Api-Version`
          // const apiVersion = response.headers.get('nylas-api-version') as
          //   | string
          //   | undefined;

          // const warning = this.getWarningForVersion(
          //   SUPPORTED_API_VERSION,
          //   apiVersion
          // );
          // if (warning) {
          //   console.warn(warning);
          // }

          if (response.status > 299) {
            return response.text().then(body => {
              try {
                const parsedApiError = JSON.parse(body);
                let error;
                if (response.status === RateLimitError.RATE_LIMIT_STATUS_CODE) {
                  error = RateLimitError.parseErrorResponse(
                    parsedApiError,
                    response.headers
                  );
                } else {
                  error = new NylasApiError(
                    response.status,
                    parsedApiError.type,
                    parsedApiError.message
                  );
                }
                if (parsedApiError.missing_fields) {
                  error.missingFields = parsedApiError.missing_fields;
                }
                if (parsedApiError.server_error) {
                  error.serverError = parsedApiError.server_error;
                }
                return reject(error);
              } catch (e) {
                const error = new NylasApiError(
                  response.status,
                  response.statusText,
                  body
                );
                return reject(error);
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
