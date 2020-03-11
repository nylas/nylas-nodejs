import async from 'async';
import isFunction from 'lodash/isFunction';

import Message from './message';
import NylasConnection from './nylas-connection';
import RestfulModel from './restful-model';
import Thread from './thread';

const REQUEST_CHUNK_SIZE = 100;

export default class RestfulModelCollection {
  connection?: NylasConnection;
  modelClass?: RestfulModel;

  constructor(modelClass, connection) {
    this.modelClass = modelClass;
    this.connection = connection;
    if (!(this.connection instanceof NylasConnection)) {
      throw new Error('Connection object not provided');
    }
    if (!this.modelClass) {
      throw new Error('Model class not provided');
    }
  }

  forEach(params: { [key: string]: any } = {}, eachCallback?: () => void, completeCallback?: () => void = null) {
    if (params.view == 'count') {
      const err = new Error('forEach() cannot be called with the count view');
      if (callback) {
        callback(err);
      }
      return Promise.reject(err);
    }

    let offset = 0;
    let finished = false;

    return async.until(
      () => finished,
      callback => {
        return this._getItems(params, offset, REQUEST_CHUNK_SIZE).then(
          items => {
            for (const item of items) {
              eachCallback(item);
            }
            offset += items.length;
            finished = items.length < REQUEST_CHUNK_SIZE;
            return callback();
          }
        );
      },
      err => {
        if (completeCallback) {
          return completeCallback(err);
        }
      }
    );
  }

  count(params: { [key: string]: any } = {}, callback?: () => void = null) {
    return this.connection
      .request({
        method: 'GET',
        path: this.path(),
        qs: { view: 'count', ...params },
      })
      .then(json => {
        if (callback) {
          callback(null, json.count);
        }
        return Promise.resolve(json.count);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  first(params: { [key: string]: any } = {}, callback?: () => void = null) {
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

  list(params: { [key: string]: any } = {}, callback?: () => void = null) {
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

  find(id: string, callback?: () => null = null, params: { [key: string]: any } = {}) {
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

  search(query: string, params: { [key: string]: any } = {}, callback: () => void = null) {
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

  delete(itemOrId: string | RestfulModel, params: { [key: string]: any } = {}, callback: () => void = null) {
    if (!itemOrId) {
      const err = new Error('delete() requires an item or an id');
      if (callback) {
        callback(err);
      }
      return Promise.reject(err);
    }

    if (isFunction(params)) {
      callback = params;
      params = {};
    }

    const item = itemOrId.id ? itemOrId : this.build({ id: itemOrId });

    const options = item.deleteRequestOptions(params);
    options.item = item;
    options.callback = callback;

    return this.deleteItem(options);
  }

  deleteItem(options: { [key: string]: any }) {
    const item = options.item;
    const callback = options.callback || null;
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
      })
      .then(() => {
        if (callback) {
          callback(null);
        }
        return Promise.resolve();
      })
      .catch(err => {
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
      model[key] = val;
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
    callback = null,
    path = null,
  }) {
    return new Promise((resolve, reject) => {
      let accumulated = [];
      let finished = false;

      return async.until(
        () => finished,
        chunkCallback => {
          const chunkOffset = offset + accumulated.length;
          const chunkLimit = Math.min(
            REQUEST_CHUNK_SIZE,
            limit - accumulated.length
          );
          return this._getItems(params, chunkOffset, chunkLimit, path)
            .then(items => {
              accumulated = accumulated.concat(items);
              finished =
                items.length < REQUEST_CHUNK_SIZE ||
                accumulated.length >= limit;
              return chunkCallback();
            })
            .catch(err => reject(err));
        },
        err => {
          if (err) {
            if (callback) {
              callback(err);
            }
            return reject(err);
          } else {
            if (callback) {
              callback(null, accumulated);
            }
            return resolve(accumulated);
          }
        }
      );
    });
  }

  _getItems(params: { [key: string]: any }, offset?: number, limit?: number, path?: string) {
    // Items can be either models or ids

    if (!path) {
      path = this.path();
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

  _createModel(json: { [key: string]: any }) {
    return new this.modelClass(this.connection, json);
  }

  _getModel(id: string, params: { [key: string]: any } = {}) {
    return this.connection
      .request({
        method: 'GET',
        path: `${this.path()}/${id}`,
        qs: params,
      })
      .then(json => {
        const model = this._createModel(json);
        return Promise.resolve(model);
      });
  }

  _getModelCollection(params: { [key: string]: any }, offset?: number, limit?: number, path?: string) {
    return this.connection
      .request({
        method: 'GET',
        path,
        qs: { ...params, offset, limit },
      })
      .then(jsonArray => {
        const models = jsonArray.map(json => {
          return this._createModel(json);
        });
        return Promise.resolve(models);
      });
  }
}
