(function() {
  var Promise, REQUEST_CHUNK_SIZE, RestfulModelCollection, _, async;

  async = require('async');

  _ = require('underscore');

  Promise = require('bluebird');

  REQUEST_CHUNK_SIZE = 100;

  module.exports = RestfulModelCollection = (function() {
    function RestfulModelCollection(modelClass, connection) {
      this.modelClass = modelClass;
      this.connection = connection;
      if (!(this.connection instanceof require('../nylas-connection'))) {
        throw new Error("Connection object not provided");
      }
      if (!this.modelClass) {
        throw new Error("Model class not provided");
      }
      this;
    }

    RestfulModelCollection.prototype.forEach = function(params, eachCallback, completeCallback) {
      var finished, offset;
      if (params == null) {
        params = {};
      }
      if (completeCallback == null) {
        completeCallback = null;
      }
      offset = 0;
      finished = false;
      return async.until(function() {
        return finished;
      }, (function(_this) {
        return function(callback) {
          return _this.getModelCollection(params, offset, REQUEST_CHUNK_SIZE).then(function(models) {
            var i, len, model;
            for (i = 0, len = models.length; i < len; i++) {
              model = models[i];
              eachCallback(model);
            }
            offset += models.length;
            finished = models.length < REQUEST_CHUNK_SIZE;
            return callback();
          });
        };
      })(this), function(err) {
        if (completeCallback) {
          return completeCallback();
        }
      });
    };

    RestfulModelCollection.prototype.count = function(params, callback) {
      if (params == null) {
        params = {};
      }
      if (callback == null) {
        callback = null;
      }
      return this.connection.request({
        method: 'GET',
        path: this.path(),
        qs: _.extend({
          view: 'count'
        }, params)
      }).then(function(json) {
        if (callback) {
          callback(null, json.count);
        }
        return Promise.resolve(json.count);
      })["catch"](function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
    };

    RestfulModelCollection.prototype.first = function(params, callback) {
      if (params == null) {
        params = {};
      }
      if (callback == null) {
        callback = null;
      }
      return this.getModelCollection(params, 0, 1).then(function(items) {
        if (callback) {
          callback(null, items[0]);
        }
        return Promise.resolve(items[0]);
      })["catch"](function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
    };

    RestfulModelCollection.prototype.list = function(params, callback) {
      var limit;
      if (params == null) {
        params = {};
      }
      if (callback == null) {
        callback = null;
      }
      limit = Infinity;
      if ('limit' in params) {
        limit = params['limit'];
      }
      return this.range(params, 0, limit, callback);
    };

    RestfulModelCollection.prototype.find = function(id, callback) {
      var err;
      if (callback == null) {
        callback = null;
      }
      if (!id) {
        err = new Error("find() must be called with an item id");
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      }
      return this.getModel(id).then(function(model) {
        if (callback) {
          callback(null, model);
        }
        return Promise.resolve(model);
      })["catch"](function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
    };

    RestfulModelCollection.prototype.range = function(params, offset, limit, callback) {
      if (params == null) {
        params = {};
      }
      if (offset == null) {
        offset = 0;
      }
      if (limit == null) {
        limit = 100;
      }
      if (callback == null) {
        callback = null;
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var accumulated, finished;
          accumulated = [];
          finished = false;
          return async.until(function() {
            return finished;
          }, function(chunkCallback) {
            var chunkLimit, chunkOffset;
            chunkOffset = offset + accumulated.length;
            chunkLimit = Math.min(REQUEST_CHUNK_SIZE, limit - accumulated.length);
            return _this.getModelCollection(params, chunkOffset, chunkLimit).then(function(models) {
              accumulated = accumulated.concat(models);
              finished = models.length < REQUEST_CHUNK_SIZE || accumulated.length >= limit;
              return chunkCallback();
            });
          }, function(err) {
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
          });
        };
      })(this));
    };

    RestfulModelCollection.prototype["delete"] = function(itemOrId, params, callback) {
      var id;
      if (params == null) {
        params = {};
      }
      if (callback == null) {
        callback = null;
      }
      id = (itemOrId != null ? itemOrId.id : void 0) != null ? itemOrId.id : itemOrId;
      if (_.isFunction(params)) {
        callback = params;
        params = {};
      }
      return this.connection.request({
        method: 'DELETE',
        qs: params,
        path: (this.path()) + "/" + id
      }).then(function() {
        if (callback) {
          callback(null);
        }
        return Promise.resolve();
      })["catch"](function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
    };

    RestfulModelCollection.prototype.build = function(args) {
      var key, model, val;
      model = new this.modelClass(this.connection);
      for (key in args) {
        val = args[key];
        model[key] = val;
      }
      return model;
    };

    RestfulModelCollection.prototype.path = function() {
      return "/" + this.modelClass.collectionName;
    };

    RestfulModelCollection.prototype.getModel = function(id) {
      return this.connection.request({
        method: 'GET',
        path: (this.path()) + "/" + id
      }).then((function(_this) {
        return function(json) {
          var model;
          model = new _this.modelClass(_this.connection, json);
          return Promise.resolve(model);
        };
      })(this));
    };

    RestfulModelCollection.prototype.getModelCollection = function(params, offset, limit) {
      return this.connection.request({
        method: 'GET',
        path: this.path(),
        qs: _.extend({}, params, {
          offset: offset,
          limit: limit
        })
      }).then((function(_this) {
        return function(jsonArray) {
          var models;
          models = jsonArray.map(function(json) {
            return new _this.modelClass(_this.connection, json);
          });
          return Promise.resolve(models);
        };
      })(this));
    };

    return RestfulModelCollection;

  })();

}).call(this);
