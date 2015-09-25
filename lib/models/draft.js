(function() {
  var Attributes, Contact, Draft, File, Message, Promise, _,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
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
      this.save = bind(this.save, this);
      return Draft.__super__.constructor.apply(this, arguments);
    }

    Draft.collectionName = 'drafts';

    Draft.attributes = _.extend({}, Message.attributes, {
      'replyToMessageId': Attributes.String({
        modelKey: 'replyToMessageId',
        jsonKey: 'reply_to_message_id'
      })
    });

    Draft.prototype.toJSON = function() {
      var json;
      json = Draft.__super__.toJSON.apply(this, arguments);
      json.file_ids = this.fileIds();
      if (this.draft) {
        json.object = 'draft';
      }
      return json;
    };

    Draft.prototype.save = function(params, callback) {
      if (params == null) {
        params = {};
      }
      if (callback == null) {
        callback = null;
      }
      return this._save(params, callback);
    };

    Draft.prototype.saveRequestBody = function() {
      return Draft.__super__.saveRequestBody.apply(this, arguments);
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
        body = this.saveRequestBody();
      }
      return this.connection.request({
        method: 'POST',
        body: body,
        path: "/send"
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
