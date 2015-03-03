(function() {
  var Attributes, Contact, Draft, File, Message, Promise, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore');

  Promise = require('bluebird');

  File = require('./file');

  Message = require('./message');

  Contact = require('./contact');

  Attributes = require('./attributes');

  module.exports = Draft = (function(superClass) {
    extend(Draft, superClass);

    function Draft() {
      return Draft.__super__.constructor.apply(this, arguments);
    }

    Draft.collectionName = 'drafts';

    Draft.prototype.save = function(callback) {
      if (callback == null) {
        callback = null;
      }
      return this.connection.request({
        method: this.id ? 'PUT' : 'POST',
        body: this.toJSON(),
        path: this.id ? "/n/" + this.namespaceId + "/drafts/" + this.id : "/n/" + this.namespaceId + "/drafts"
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

    Draft.prototype.send = function(callback) {
      var body;
      if (callback == null) {
        callback = null;
      }
      if (this.id) {
        body = {
          'draft_id': this.id,
          'version': this.version
        };
      } else {
        body = this.toJSON();
      }
      return this.connection.request({
        method: 'POST',
        body: body,
        path: "/n/" + this.namespaceId + "/send"
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

    return Draft;

  })(Message);

}).call(this);
