import async from 'async';
import _ from 'underscore';
import Promise from 'bluebird';

import Message from './message';
import Thread from './thread';

const REQUEST_CHUNK_SIZE = 100;

export default class RestfulModelCollection {
  constructor(modelClass, connection) {
    this.modelClass = modelClass;
    this.connection = connection;
    if (!(this.connection instanceof require('../nylas-connection'))) {
      throw new Error('Connection object not provided');
    }
    if (!this.modelClass) {
      throw new Error('Model class not provided');
    }
  }

  forEach(params = {}, eachCallback, completeCallback = null) {
    let offset = 0;
    let finished = false;

    return async.until(
      () => finished,
      callback => {
        return this._getModelCollection(
          params,
          offset,
          REQUEST_CHUNK_SIZE
        ).then(models => {
          for (const model of models) {
            eachCallback(model);
          }
          offset += models.length;
          finished = models.length < REQUEST_CHUNK_SIZE;
          return callback();
        });
      },
      err => {
        if (completeCallback) {
          return completeCallback();
        }
      }
    );
  }

  count(params = {}, callback = null) {
    return this.connection
      .request({
        method: 'GET',
        path: this.path(),
        qs: _.extend({ view: 'count' }, params),
      })
      .then(json => {
        if (callback) {
          callback(null, json.count);
        }
        return Promise.resolve(json.count);
      })
      .catch(function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  first(params = {}, callback = null) {
    return this._getModelCollection(params, 0, 1)
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

  list(params, callback = null) {
    if (!params) {
      params = {};
    }
    let limit = Infinity;
    if ('limit' in params) {
      limit = params['limit'];
    }

    return this._range({ params, limit, callback });
  }

  find(id, callback = null, params = {}) {
    if (!id) {
      const err = new Error('find() must be called with an item id');
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

  search(query, params = {}, callback = null) {
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

  delete(itemOrId, params = {}, callback = null) {
    const id =
      (itemOrId != null ? itemOrId.id : undefined) != null
        ? itemOrId.id
        : itemOrId;
    if (_.isFunction(params)) {
      callback = params;
      params = {};
    }
    return this.connection
      .request({
        method: 'DELETE',
        qs: params,
        path: `${this.path()}/${id}`,
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

  build(args) {
    const model = new this.modelClass(this.connection);
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
          return this._getModelCollection(params, chunkOffset, chunkLimit, path)
            .then(models => {
              accumulated = accumulated.concat(models);
              finished =
                models.length < REQUEST_CHUNK_SIZE ||
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

  _createModel(json) {
    return new this.modelClass(this.connection, json);
  }

  _getModel(id, params = {}) {
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

  _getModelCollection(params, offset, limit, path = this.path()) {
    return this.connection
      .request({
        method: 'GET',
        path,
        qs: _.extend({}, params, { offset, limit }),
      })
      .then(jsonArray => {
        const models = jsonArray.map(json => {
          return this._createModel(json);
        });
        return Promise.resolve(models);
      });
  }
}
