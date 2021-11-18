// TODO since node 10 URL is global
import { URL } from 'url';
import fetch, { Request } from 'node-fetch';
import * as config from './config';
import RestfulModelCollection from './models/restful-model-collection';
import CalendarRestfulModelCollection from './models/calendar-restful-model-collection';
import ContactRestfulModelCollection from './models/contact-restful-model-collection';
import RestfulModelInstance from './models/restful-model-instance';
import Account from './models/account';
import Thread from './models/thread';
import Message from './models/message';
import Draft from './models/draft';
import File from './models/file';
import Event from './models/event';
import JobStatus from './models/job-status';
import Resource from './models/resource';
import Delta from './models/delta';
import { Folder, Label } from './models/folder';
import FormData, { AppendOptions } from 'form-data';
import Neural from './models/neural';
import NylasApiError from './models/nylas-api-error';
import ComponentRestfulModelCollection from './models/component-restful-model-collection';
import SchedulerRestfulModelCollection from './models/scheduler-restful-model-collection';

const PACKAGE_JSON = require('../package.json');
const SDK_VERSION = PACKAGE_JSON.version;
const SUPPORTED_API_VERSION = '2.3';

export type RequestOptions = {
  path: string;
  method?: string;
  headers?: { [key: string]: string };
  qs?: { [key: string]: any };
  downloadRequest?: boolean;
  json?: boolean;
  formData?: { [key: string]: FormDataType };
  body?: any;
  baseUrl?: string;
  url?: URL;
};

export type FormDataType = {
  value: any;
  options?: { [key: string]: any } | AppendOptions;
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
  messages: RestfulModelCollection<Message> = new RestfulModelCollection(
    Message,
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
  jobStatuses: RestfulModelCollection<JobStatus> = new RestfulModelCollection(
    JobStatus,
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
  deltas = new Delta(this);
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
          for (const item in value) {
            url.searchParams.set('metadata_pair', `${item}:${value[item]}`);
          }
        } else if (Array.isArray(value)) {
          for (const item of value) {
            url.searchParams.append(key, item);
          }
        } else {
          url.searchParams.set(key, value);
        }
      }
    }
    options.url = url;

    const headers = { ...options.headers };
    const user =
      options.path.substr(0, 3) === '/a/' || options.path.includes('/component')
        ? config.clientSecret
        : this.accessToken;
    if (user) {
      headers['authorization'] =
        'Basic ' + Buffer.from(`${user}:`, 'utf8').toString('base64');
    }
    if (!headers['User-Agent']) {
      headers['User-Agent'] = `Nylas Node SDK v${SDK_VERSION}`;
    }
    headers['Nylas-API-Version'] = SUPPORTED_API_VERSION;
    headers['Nylas-SDK-API-Version'] = SUPPORTED_API_VERSION;
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
    } else if (options.body && options.json !== false) {
      options.body = JSON.stringify(options.body);
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

  _getWarningForVersion(sdkApiVersion?: string, apiVersion?: string) {
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

  request(options: RequestOptions) {
    const req = this.newRequest(options);
    return new Promise<any>((resolve, reject) => {
      return fetch(req)
        .then(response => {
          if (typeof response === 'undefined') {
            return reject(new Error('No response'));
          }
          // node headers are lowercaser so this refers to `Nylas-Api-Version`
          const apiVersion = response.headers.get('nylas-api-version') as
            | string
            | undefined;

          const warning = this._getWarningForVersion(
            SUPPORTED_API_VERSION,
            apiVersion
          );
          if (warning) {
            console.warn(warning);
          }

          if (response.status > 299) {
            return response.json().then(body => {
              const error = new NylasApiError(
                response.status,
                body.type,
                body.message
              );
              if (body.missing_fields) {
                error.missingFields = body.missing_fields;
              }
              if (body.server_error) {
                error.serverError = body.server_error;
              }
              return reject(error);
            });
          } else {
            if (options.downloadRequest) {
              response
                .buffer()
                .then(buffer => {
                  // Return an object with the headers and the body as a buffer
                  const fileDetails: { [key: string]: any } = {};
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
              response.headers.get('Content-Type') === 'message/rfc822'
            ) {
              return resolve(response.text());
            } else {
              return resolve(response.json());
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
