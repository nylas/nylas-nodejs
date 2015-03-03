(function() {
  var Attributes, Promise, RestfulModel;

  Attributes = require('./attributes');

  Promise = require('bluebird');

  module.exports = RestfulModel = (function() {
    RestfulModel.attributes = {
      'id': Attributes.String({
        modelKey: 'id'
      }),
      'object': Attributes.String({
        modelKey: 'object'
      }),
      'namespaceId': Attributes.String({
        modelKey: 'namespaceId',
        jsonKey: 'namespace_id'
      })
    };

    function RestfulModel(connection, namespaceId, json) {
      this.connection = connection;
      this.namespaceId = namespaceId != null ? namespaceId : null;
      if (json == null) {
        json = null;
      }
      if (!(this.connection instanceof require('../nilas-connection'))) {
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

    RestfulModel.prototype.toString = function() {
      return JSON.stringify(this.toJSON());
    };

    return RestfulModel;

  })();

}).call(this);
