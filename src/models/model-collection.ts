import NylasConnection from '../nylas-connection';
import Model from './model';

export type GetCallback = (error: Error | null, result?: Model) => void;

const REQUEST_CHUNK_SIZE = 100;

export type CollectionModel = {
  requestID: string;
  nextCursor?: string;
  data: Array<Model>;
};

export default class ModelCollection<T extends Model> {
  connection: NylasConnection;
  modelClass: any;
  _path: string;
  baseUrl?: string;

  constructor(modelClass: any, connection: NylasConnection, path: string) {
    this.modelClass = modelClass;
    this.connection = connection;
    this._path = path;
    if (!this.connection) {
      throw new Error('Connection object not provided');
    }
    if (!this.modelClass) {
      throw new Error('Model class not provided');
    }
  }

  forEach(
    params: Record<string, unknown> = {},
    eachCallback: (item: T) => void,
    completeCallback?: (err?: Error | null | undefined) => void
  ): void {
    if (params.view == 'count') {
      const err = new Error('forEach() cannot be called with the count view');
      if (completeCallback) {
        completeCallback(err);
      }
      throw err;
    }

    let cursor = '';

    const iteratee = (): Promise<void> => {
      return this.getItems(params, cursor, REQUEST_CHUNK_SIZE).then(
        collection => {
          for (const item of collection.data) {
            eachCallback(item as T);
          }
          cursor = collection.nextCursor ? collection.nextCursor : '';
          const finished = collection.data.length < REQUEST_CHUNK_SIZE;
          if (!finished) {
            return iteratee();
          }
        }
      );
    };

    iteratee().then(
      () => {
        if (completeCallback) {
          completeCallback();
        }
      },
      (err: Error) => {
        if (completeCallback) {
          return completeCallback(err);
        }
      }
    );
  }

  list(
    params: Record<string, unknown> = {},
    callback?: (error: Error | null, obj?: T[]) => void
  ): Promise<T[]> {
    if (params.view == 'count') {
      const err = new Error('list() cannot be called with the count view');
      if (callback) {
        callback(err);
      }
      return Promise.reject(err);
    }

    const limit = (params.limit as number) || Infinity;
    const cursor = params.cursor as string;
    return this.range({ params, cursor, limit, callback });
  }

  find(
    id: string,
    paramsArg?: Record<string, unknown> | GetCallback | null,
    callbackArg?: GetCallback | Record<string, unknown> | null
  ): Promise<T> {
    // callback used to be the second argument, and params was the third
    let callback: GetCallback | undefined;
    if (typeof callbackArg === 'function') {
      callback = callbackArg as GetCallback;
    } else if (typeof paramsArg === 'function') {
      callback = paramsArg as GetCallback;
    }

    let params: Record<string, unknown> = {};
    if (paramsArg && typeof paramsArg === 'object') {
      params = paramsArg;
    } else if (callbackArg && typeof callbackArg === 'object') {
      params = callbackArg;
    }

    if (!id) {
      const err = new Error('find() must be called with an item id');
      if (callback) {
        callback(err);
      }
      return Promise.reject(err);
    }

    if (params.view == 'count' || params.view == 'ids') {
      const err = new Error(
        'find() cannot be called with the count or ids view'
      );
      if (callback) {
        callback(err);
      }
      return Promise.reject(err);
    }

    return this.getModel(id, params)
      .then(model => {
        if (callback) {
          callback(null, model);
        }
        return Promise.resolve(model);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  path(): string {
    return this._path;
  }

  protected range({
    params = {},
    cursor = '',
    limit = 100,
    callback,
    path,
  }: {
    params?: Record<string, unknown>;
    cursor?: string;
    limit?: number;
    callback?: (error: Error | null, results?: T[]) => void;
    path?: string;
  }): Promise<T[]> {
    let accumulated: T[] = [];

    const iteratee = (): Promise<void> => {
      const chunkLimit = Math.min(
        REQUEST_CHUNK_SIZE,
        limit - accumulated.length
      );
      return this.getItems(params, cursor, chunkLimit, path).then(items => {
        accumulated = accumulated.concat(items.data as Array<T>);
        const finished =
          items.data.length < REQUEST_CHUNK_SIZE || accumulated.length >= limit;
        if (!finished) {
          return iteratee();
        }
      });
    };

    // do not return rejected promise when callback is provided
    // to prevent unhandled rejection warning
    return iteratee().then(
      () => {
        if (callback) {
          callback(null, accumulated);
        }
        return accumulated;
      },
      (err: Error) => {
        if (callback) {
          callback(err);
        }
        throw err;
      }
    );
  }

  protected getItems(
    params: Record<string, unknown>,
    cursor: string,
    limit: number,
    path?: string
  ): Promise<CollectionModel> {
    // Items can be either models or ids

    if (!path) {
      path = this.path();
    }

    if (params.view == 'ids') {
      return this.connection.request({
        method: 'GET',
        path,
        qs: { ...params, cursor, limit },
        baseUrl: this.baseUrl,
      });
    }

    return this.getModelCollection(params, cursor, limit, path);
  }

  protected createModel(json: Record<string, unknown>): T {
    return new this.modelClass().fromJSON(json) as T;
  }
  protected createCollectionModel(
    json: Record<string, unknown>
  ): CollectionModel {
    const requestID: string =
      typeof json.request_id === 'string' ? json.request_id : '';
    const nextCursor: string =
      typeof json.next_cursor === 'string' ? json.next_cursor : '';
    const dataRaw = json.data as [];
    const data = dataRaw.map(json => {
      return this.createModel(json);
    });
    const collectionModel: CollectionModel = {
      requestID,
      nextCursor,
      data,
    };
    return collectionModel;
  }

  private getModel(
    id: string,
    params: Record<string, unknown> = {}
  ): Promise<T> {
    return this.connection
      .request({
        method: 'GET',
        path: `${this.path()}/${id}`,
        qs: params,
        baseUrl: this.baseUrl,
      })
      .then(json => {
        const model = this.createModel(json);
        return Promise.resolve(model);
      });
  }

  private getModelCollection(
    params: Record<string, unknown>,
    cursor: string,
    limit: number,
    path: string
  ): Promise<CollectionModel> {
    return this.connection
      .request({
        method: 'GET',
        path,
        qs: { ...params, cursor, limit },
        baseUrl: this.baseUrl,
      })
      .then(json => {
        const models = this.createCollectionModel(json);
        return Promise.resolve(models);
      });
  }
}
