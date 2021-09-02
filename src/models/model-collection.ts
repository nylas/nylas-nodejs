import NylasConnection from '../nylas-connection';
import Model from './model';

export type GetCallback = (error: Error | null, result?: Model) => void;

const REQUEST_CHUNK_SIZE = 100;

export default class ModelCollection<T extends Model> {
  connection: NylasConnection;
  modelClass: typeof Model;
  path: string;

  constructor(
    modelClass: typeof Model,
    connection: NylasConnection,
    path: string
  ) {
    this.modelClass = modelClass;
    this.connection = connection;
    this.path = path;
    if (!this.connection) {
      throw new Error('Connection object not provided');
    }
    if (!this.modelClass) {
      throw new Error('Model class not provided');
    }
  }

  forEach(
    params: { [key: string]: any } = {},
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

    let offset = 0;

    const iteratee = (): Promise<void> => {
      return this._getItems(params, offset, REQUEST_CHUNK_SIZE).then(items => {
        for (const item of items) {
          eachCallback(item);
        }
        offset += items.length;
        const finished = items.length < REQUEST_CHUNK_SIZE;
        if (!finished) {
          return iteratee();
        }
      });
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
    params: { [key: string]: any } = {},
    callback?: (error: Error | null, obj?: T[]) => void
  ): Promise<T[]> {
    if (params.view == 'count') {
      const err = new Error('list() cannot be called with the count view');
      if (callback) {
        callback(err);
      }
      return Promise.reject(err);
    }

    const limit = params.limit || Infinity;
    const offset = params.offset;
    return this._range({ params, offset, limit, callback });
  }

  find(
    id: string,
    paramsArg?: { [key: string]: any } | GetCallback | null,
    callbackArg?: GetCallback | { [key: string]: any } | null
  ): Promise<T> {
    // callback used to be the second argument, and params was the third
    let callback: GetCallback | undefined;
    if (typeof callbackArg === 'function') {
      callback = callbackArg as GetCallback;
    } else if (typeof paramsArg === 'function') {
      callback = paramsArg as GetCallback;
    }

    let params: { [key: string]: any } = {};
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

    return this._getModel(id, params)
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

  _range({
    params = {},
    offset = 0,
    limit = 100,
    callback,
    path,
  }: {
    params?: { [key: string]: any };
    offset?: number;
    limit?: number;
    callback?: (error: Error | null, results?: T[]) => void;
    path?: string;
  }): Promise<T[]> {
    let accumulated: T[] = [];

    const iteratee = (): Promise<void> => {
      const chunkOffset = offset + accumulated.length;
      const chunkLimit = Math.min(
        REQUEST_CHUNK_SIZE,
        limit - accumulated.length
      );
      return this._getItems(params, chunkOffset, chunkLimit, path).then(
        items => {
          accumulated = accumulated.concat(items);
          const finished =
            items.length < REQUEST_CHUNK_SIZE || accumulated.length >= limit;
          if (!finished) {
            return iteratee();
          }
        }
      );
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

  _getItems(
    params: { [key: string]: any },
    offset: number,
    limit: number,
    path?: string
  ): Promise<T[]> {
    // Items can be either models or ids

    if (!path) {
      path = this.path;
    }

    if (params.view == 'ids') {
      return this.connection.request({
        method: 'GET',
        path,
        qs: { ...params, offset, limit },
      });
    }

    return this._getModelCollection(params, offset, limit, path);
  }

  _createModel(json: { [key: string]: any }): T {
    return new this.modelClass().fromJSON(json) as T;
  }

  _getModel(id: string, params: { [key: string]: any } = {}): Promise<T> {
    return this.connection
      .request({
        method: 'GET',
        path: `${this.path}/${id}`,
        qs: params,
      })
      .then((json: any) => {
        const model = this._createModel(json);
        return Promise.resolve(model);
      });
  }

  _getModelCollection(
    params: { [key: string]: any },
    offset: number,
    limit: number,
    path: string
  ): Promise<T[]> {
    return this.connection
      .request({
        method: 'GET',
        path,
        qs: { ...params, offset, limit },
      })
      .then((jsonArray: any) => {
        const models = jsonArray.map((json: any) => {
          return this._createModel(json);
        });
        return Promise.resolve(models);
      });
  }
}
