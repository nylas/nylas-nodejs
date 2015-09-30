(function() {
  var Attributes, File, RestfulModel, _,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  Attributes = require('./attributes');

  _ = require('underscore');

  module.exports = File = (function(superClass) {
    extend(File, superClass);

    function File() {
      this.upload = bind(this.upload, this);
      return File.__super__.constructor.apply(this, arguments);
    }

    File.collectionName = 'files';

    File.attributes = _.extend({}, RestfulModel.attributes, {
      'filename': Attributes.String({
        modelKey: 'filename',
        jsonKey: 'filename'
      }),
      'size': Attributes.Number({
        modelKey: 'size',
        jsonKey: 'size'
      }),
      'contentType': Attributes.String({
        modelKey: 'contentType',
        jsonKey: 'content_type'
      }),
      'messageIds': Attributes.Collection({
        modelKey: 'messageIds',
        jsonKey: 'message_ids',
        itemClass: String
      }),
      'contentId': Attributes.String({
        modelKey: 'contentId',
        jsonKey: 'content_id'
      })
    });

    File.prototype.upload = function(callback) {
      if (callback == null) {
        callback = null;
      }
      if (!this.filename) {
        throw new Error("Please define a filename");
      }
      if (!this.data) {
        throw new Error("Please add some data to the file");
      }
      if (!this.contentType) {
        throw new Error("Please define a content-type");
      }
      return this.connection.request({
        method: 'POST',
        json: false,
        path: "/" + this.constructor.collectionName,
        formData: {
          file: {
            value: this.data,
            options: {
              filename: this.filename,
              contentType: this.contentType
            }
          }
        }
      }).then((function(_this) {
        return function(json) {
          if (json.length > 0) {
            _this.fromJSON(json[0]);
            if (callback) {
              callback(null, _this);
            }
            return Promise.resolve(_this);
          } else {
            return Promise.reject(null);
          }
        };
      })(this))["catch"](function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
    };

    return File;

  })(RestfulModel);

}).call(this);
