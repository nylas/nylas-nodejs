(function() {
  var Attributes, Folder, Label, Promise, RestfulModel, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  Attributes = require('./attributes');

  Promise = require('bluebird');

  _ = require('underscore');

  Label = (function(superClass) {
    extend(Label, superClass);

    function Label() {
      return Label.__super__.constructor.apply(this, arguments);
    }

    Label.collectionName = 'labels';

    Label.attributes = _.extend({}, RestfulModel.attributes, {
      'displayName': Attributes.String({
        modelKey: 'displayName',
        jsonKey: 'display_name'
      }),
      'name': Attributes.String({
        modelKey: 'name',
        jsonKey: 'name'
      })
    });

    Label.prototype.saveRequestBody = function() {
      var json;
      json = {};
      json['display_name'] = this.displayName;
      json['name'] = this.name;
      return json;
    };

    Label.prototype.save = function(params, callback) {
      if (params == null) {
        params = {};
      }
      if (callback == null) {
        callback = null;
      }
      return this._save(params, callback);
    };

    return Label;

  })(RestfulModel);

  Folder = (function(superClass) {
    extend(Folder, superClass);

    function Folder() {
      return Folder.__super__.constructor.apply(this, arguments);
    }

    Folder.collectionName = 'folders';

    return Folder;

  })(Label);

  module.exports.Label = Label;

  module.exports.Folder = Folder;

}).call(this);
