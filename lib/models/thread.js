(function() {
  var Attributes, Contact, Folder, Label, Message, RestfulModel, Tag, Thread, _,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore');

  Tag = require('./tag');

  Message = require('./message');

  RestfulModel = require('./restful-model');

  Contact = require('./contact');

  Attributes = require('./attributes');

  Label = require('./folder').Label;

  Folder = require('./folder').Folder;

  module.exports = Thread = (function(superClass) {
    extend(Thread, superClass);

    function Thread() {
      this.tagIds = bind(this.tagIds, this);
      this.save = bind(this.save, this);
      this.fromJSON = bind(this.fromJSON, this);
      return Thread.__super__.constructor.apply(this, arguments);
    }

    Thread.collectionName = 'threads';

    Thread.attributes = _.extend({}, RestfulModel.attributes, {
      'snippet': Attributes.String({
        modelKey: 'snippet'
      }),
      'subject': Attributes.String({
        modelKey: 'subject'
      }),
      'unread': Attributes.Boolean({
        queryable: true,
        modelKey: 'unread'
      }),
      'starred': Attributes.Boolean({
        queryable: true,
        modelKey: 'starred'
      }),
      'messageIds': Attributes.StringList({
        modelKey: 'messageIds',
        jsonKey: 'message_ids'
      }),
      'tags': Attributes.Collection({
        queryable: true,
        modelKey: 'tags',
        itemClass: Tag
      }),
      'participants': Attributes.Collection({
        modelKey: 'participants',
        itemClass: Contact
      }),
      'lastMessageTimestamp': Attributes.DateTime({
        queryable: true,
        modelKey: 'lastMessageTimestamp',
        jsonKey: 'last_message_timestamp'
      }),
      'labels': Attributes.Collection({
        modelKey: 'labels',
        itemClass: Label
      }),
      'folder': Attributes.Object({
        modelKey: 'folder',
        itemClass: Folder
      })
    });

    Thread.prototype.fromJSON = function(json) {
      Thread.__super__.fromJSON.call(this, json);
      this.unread = this.isUnread();
      return this;
    };

    Thread.prototype.saveRequestBody = function() {
      var json, label;
      json = {};
      if (this.labels != null) {
        json['labels'] = (function() {
          var i, len, ref, results;
          ref = this.labels;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            label = ref[i];
            results.push(label.id);
          }
          return results;
        }).call(this);
      } else if (this.folder != null) {
        json['folder'] = this.folder.id;
      }
      json['starred'] = this.starred;
      json['unread'] = this.unread;
      return json;
    };

    Thread.prototype.save = function(params, callback) {
      if (params == null) {
        params = {};
      }
      if (callback == null) {
        callback = null;
      }
      return this._save(params, callback);
    };

    Thread.prototype.tagIds = function() {
      return _.map(this.tags, function(tag) {
        return tag.id;
      });
    };

    Thread.prototype.isUnread = function() {
      return this.tagIds().indexOf('unread') !== -1;
    };

    Thread.prototype.isStarred = function() {
      return this.tagIds().indexOf('starred') !== -1;
    };

    Thread.prototype.markAsRead = function() {};

    Thread.prototype.star = function() {
      return this.addRemoveTags(['starred'], []);
    };

    Thread.prototype.unstar = function() {
      return this.addRemoveTags([], ['starred']);
    };

    Thread.prototype.toggleStar = function() {
      if (this.isStarred()) {
        return this.unstar();
      } else {
        return this.star();
      }
    };

    Thread.prototype.archive = function() {
      return this.addRemoveTags(['archive'], ['inbox']);
    };

    Thread.prototype.unarchive = function() {
      return this.addRemoveTags(['inbox'], ['archive']);
    };

    Thread.prototype.addRemoveTags = function(tagIdsToAdd, tagIdsToRemove) {};

    return Thread;

  })(RestfulModel);

}).call(this);
