import Message from './message';
import NylasConnection from '../nylas-connection';
import RestfulModel from './restful-model';
import Thread from './thread';

const REQUEST_CHUNK_SIZE = 100;

export type GetCallback = (error: Error | null, result?: RestfulModel) => void;

export default class RestfulModelCollection<T extends RestfulModel> {
  connection: NylasConnection;
  modelClass: typeof RestfulModel;
  baseUrl?: string;

  constructor(modelClass: typeof RestfulModel, connection: NylasConnection) {
    this.modelClass = modelClass;
    this.connection = connection;
    if (!(this.connection instanceof NylasConnection)) {
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
  ) {
    if (params.view == 'count') {
      const err = new Error('forEach() cannot be called with the count view');
      if (completeCallback) {
        completeCallback(err);
      }
      return Promise.reject(err);
    }

    let offset = 0;

    const iteratee = (): Promise<void> => {
      return this._getItems(params, offset, REQUEST_CHUNK_SIZE).then(items => {
        for (const item of items) {
          eachCallback(item);
        }
        offset += items.length;
        const finished = items.length < REQUEST_CHUNK_SIZE;
        if (finished === false) {
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

  count(
    params: { [key: string]: any } = {},
    callback?: (err: Error | null, num?: number) => void
  ) {
    return this.connection
      .request({
        method: 'GET',
        path: this.path(),
        qs: { view: 'count', ...params },
        baseUrl: this.baseUrl,
      })
      .then((json: any) => {
        if (callback) {
          callback(null, json.count);
        }
        return Promise.resolve(json.count);
      })
      .catch((err: Error) => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  first(
    params: { [key: string]: any } = {},
    callback?: (error: Error | null, model?: T) => void
  ) {
    if (params.view == 'count') {
      const err = new Error('first() cannot be called with the count view');
      if (callback) {
        callback(err);
      }
      return Promise.reject(err);
    }

    return this._getItems(params, 0, 1)
      .then(items => {
        if (callback) {
          callback(null, items[0]);
        }
        return Promise.resolve(items[0]);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  list(
    params: { [key: string]: any } = {},
    callback?: (error: Error | null, obj?: T[]) => void
  ) {
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
  ) {
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

  search(
    query: string,
    params: { [key: string]: any } = {},
    callback?: (error: Error | null) => void
  ) {
    if (this.modelClass != Message && this.modelClass != Thread) {
      const err = new Error(
        'search() can only be called for messages and threads'
      );
      if (callback) {
        callback(err);
      }
      return Promise.reject(err);
    }

    if (!query) {
      const err = new Error('search() requires a query string');
      if (callback) {
        callback(err);
      }
      return Promise.reject(err);
    }

    params.q = query;
    const limit = params.limit || 40;
    const offset = params.offset;
    const path = `${this.path()}/search`;

    return this._range({ params, offset, limit, path });
  }

  delete(
    itemOrId: T | string,
    params: { [key: string]: any } = {},
    callback?: (error: Error | null) => void
  ) {
    if (!itemOrId) {
      const err = new Error('delete() requires an item or an id');
      if (callback) {
        callback(err);
      }
      return Promise.reject(err);
    }

    if (typeof params === 'function') {
      callback = params as (error: Error | null) => void;
      params = {};
    }

    const item =
      typeof itemOrId === 'string' ? this.build({ id: itemOrId }) : itemOrId;

    const options: { [key: string]: any } = item.deleteRequestOptions(params);
    options.item = item;

    return this.deleteItem(options, callback);
  }

  deleteItem(
    options: { [key: string]: any },
    callbackArg?: (error: Error | null) => void
  ) {
    const item = options.item;
    // callback used to be in the options object
    const callback = options.callback ? options.callback : callbackArg;
    const body = options.hasOwnProperty('body')
      ? options.body
      : item.deleteRequestBody({});
    const qs = options.hasOwnProperty('qs')
      ? options.qs
      : item.deleteRequestQueryString({});

    return this.connection
      .request({
        method: 'DELETE',
        qs: qs,
        body: body,
        path: `${this.path()}/${item.id}`,
        baseUrl: this.baseUrl,
      })
      .then(data => {
        if (callback) {
          callback(null, data);
        }
        return Promise.resolve(data);
      })
      .catch((err: Error) => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  build(args: { [key: string]: any }) {
    const model = this._createModel({});
    for (const key in args) {
      const val = args[key];
      (model as any)[key] = val;
    }
    return model;
  }

  path() {
    return `/${this.modelClass.collectionName}`;
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
  }) {
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
          if (finished === false) {
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
          return callback(null, accumulated);
        }
        return accumulated;
      },
      (err: Error) => {
        if (callback) {
          return callback(err);
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
      path = this.path();
    }

    if (params.view == 'ids') {
      return this.connection.request({
        method: 'GET',
        path,
        qs: { ...params, offset, limit },
        baseUrl: this.baseUrl,
      });
    }

    return this._getModelCollection(params, offset, limit, path);
  }

  _createModel(json: { [key: string]: any }) {
    return new this.modelClass(this.connection, json) as T;
  }

  _getModel(id: string, params: { [key: string]: any } = {}): Promise<T> {
    return this.connection
      .request({
        method: 'GET',
        path: `${this.path()}/${id}`,
        qs: params,
        baseUrl: this.baseUrl,
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
        baseUrl: this.baseUrl,
      })
      .then((jsonArray: any) => {
        const models = jsonArray.map((json: any) => {
          return this._createModel(json);
        });
        return Promise.resolve(models);
      });
  }
}
