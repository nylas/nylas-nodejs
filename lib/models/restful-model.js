(function() {
  var Attributes, Promise, RestfulModel, _;

  Attributes = require('./attributes');

  Promise = require('bluebird');

  _ = require('underscore');

  module.exports = RestfulModel = (function() {
    RestfulModel.attributes = {
      'id': Attributes.String({
        modelKey: 'id'
      }),
      'object': Attributes.String({
        modelKey: 'object'
      }),
      'accountId': Attributes.String({
        modelKey: 'account_id'
      })
    };

    function RestfulModel(connection, json) {
      this.connection = connection;
      if (json == null) {
        json = null;
      }
      if (!(this.connection instanceof require('../nylas-connection'))) {
        throw new Error("Connection object not provided");
      }
      if (json) {
        this.fromJSON(json);
      }
      this;
    }

    RestfulModel.prototype.attributes = function() {
      return this.constructor.attributes;
    };

    RestfulModel.prototype.isEqual = function(other) {
      return (other != null ? other.id : void 0) === this.id && (other != null ? other.constructor : void 0) === this.constructor;
    };

    RestfulModel.prototype.fromJSON = function(json) {
      var attr, key, ref;
      ref = this.attributes();
      for (key in ref) {
        attr = ref[key];
        if (json[attr.jsonKey] !== void 0) {
          this[key] = attr.fromJSON(json[attr.jsonKey], this);
        }
      }
      return this;
    };

    RestfulModel.prototype.toJSON = function() {
      var attr, json, key, ref;
      json = {};
      ref = this.attributes();
      for (key in ref) {
        attr = ref[key];
        json[attr.jsonKey] = attr.toJSON(this[key]);
      }
      json['object'] = this.constructor.name.toLowerCase();
      return json;
    };

    RestfulModel.prototype.saveRequestBody = function() {
      return this.toJSON();
    };

    RestfulModel.prototype.toString = function() {
      return JSON.stringify(this.toJSON());
    };

    RestfulModel.prototype._save = function(params, callback) {
      if (params == null) {
        params = {};
      }
      if (callback == null) {
        callback = null;
      }
      if (_.isFunction(params)) {
        callback = params;
        params = {};
      }
      return this.connection.request({
        method: this.id ? 'PUT' : 'POST',
        body: this.saveRequestBody(),
        qs: params,
        path: this.id ? "/" + this.constructor.collectionName + "/" + this.id : "/" + this.constructor.collectionName
      }).then((function(_this) {
        return function(json) {
          _this.fromJSON(json);
          if (callback) {
            callback(null, _this);
          }
          return Promise.resolve(_this);
        };
      })(this))["catch"](function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
    };

    return RestfulModel;

  })();

}).call(this);
