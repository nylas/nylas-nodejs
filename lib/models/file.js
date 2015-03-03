(function() {
  var Attributes, File, RestfulModel, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  Attributes = require('./attributes');

  _ = require('underscore');

  module.exports = File = (function(superClass) {
    extend(File, superClass);

    function File() {
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

    return File;

  })(RestfulModel);

}).call(this);
