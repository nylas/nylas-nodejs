import Attributes from './attributes';
import NylasConnection from '../nylas-connection';
import Model from './model';

export type SaveCallback = (error: Error | null, result?: RestfulModel) => void;

interface RestfulModelJSON {
  id: string;
  object: string;
  accountId: string;
  [key: string]: any;
}

export default class RestfulModel extends Model {
  static endpointName = ''; // overrridden in subclasses
  static collectionName = ''; // overrridden in subclasses

  accountId?: string;
  connection: NylasConnection;
  id?: string;
  object?: string;

  constructor(connection: NylasConnection, props?: Partial<RestfulModelJSON>) {
    super();
    this.connection = connection;
    if (!this.connection) {
      throw new Error('Connection object not provided');
    }
    if (props) {
      super.initAttributes(props);
    }
  }

  static propsFromJSON(
    json: Partial<RestfulModelJSON> = {},
    parent: any
  ): Partial<RestfulModelJSON> {
    return super.propsFromJSON(json, parent);
  }

  isEqual(other: RestfulModel): boolean {
    return (
      (other ? other.id : undefined) === this.id &&
      (other ? other.constructor : undefined) === this.constructor
    );
  }

  fromJSON(json: Partial<RestfulModelJSON> = {}): this {
    return super.fromJSON(json) as this;
  }

  // Subclasses should override this method.
  pathPrefix(): string {
    return '';
  }

  saveEndpoint(): string {
    const collectionName = (this.constructor as any).collectionName;
    return `${this.pathPrefix()}/${collectionName}`;
  }

  // saveRequestBody is used by save(). It returns a JSON dict containing only the
  // fields the API allows updating. Subclasses should override this method.
  saveRequestBody(): any {
    return this.toJSON(true);
  }

  // deleteRequestQueryString is used by delete(). Subclasses should override this method.
  deleteRequestQueryString(_params: { [key: string]: any }): any {
    return {};
  }
  // deleteRequestBody is used by delete(). Subclasses should override this method.
  deleteRequestBody(_params: { [key: string]: any }): any {
    return {};
  }

  // deleteRequestOptions is used by delete(). Subclasses should override this method.
  deleteRequestOptions(params: { [key: string]: any }): any {
    return {
      body: this.deleteRequestBody(params),
      qs: this.deleteRequestQueryString(params),
    };
  }

  // Not every model needs to have a save function, but those who
  // do shouldn't have to reimplement the same boilerplate.
  // They should instead define a save() function which calls _save.
  _save(
    params: {} | SaveCallback = {},
    callback?: SaveCallback
  ): Promise<this> {
    if (typeof params === 'function') {
      callback = params as SaveCallback;
      params = {};
    }
    return this.connection
      .request({
        method: this.id ? 'PUT' : 'POST',
        body: this.saveRequestBody(),
        qs: params,
        path: this.id
          ? `${this.saveEndpoint()}/${this.id}`
          : `${this.saveEndpoint()}`,
      })
      .then(json => {
        this.fromJSON(json as RestfulModelJSON);
        if (callback) {
          callback(null, this);
        }
        return Promise.resolve(this);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  _get(
    params: { [key: string]: any } = {},
    callback?: (error: Error | null, result?: any) => void,
    pathSuffix = ''
  ): Promise<any> {
    const collectionName = (this.constructor as any).collectionName;
    return this.connection
      .request({
        method: 'GET',
        path: `/${collectionName}/${this.id}${pathSuffix}`,
        qs: params,
      })
      .then(response => {
        if (callback) {
          callback(null, response);
        }
        return Promise.resolve(response);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }
}
(RestfulModel as any).attributes = {
  id: Attributes.String({
    modelKey: 'id',
    readOnly: true,
  }),
  object: Attributes.String({
    modelKey: 'object',
    readOnly: true,
  }),
  accountId: Attributes.String({
    modelKey: 'accountId',
    jsonKey: 'account_id',
    readOnly: true,
  }),
};
