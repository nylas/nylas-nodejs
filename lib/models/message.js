(function() {
  var Attributes, Contact, File, Folder, Label, Message, RestfulModel, _,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore');

  File = require('./file');

  RestfulModel = require('./restful-model');

  Contact = require('./contact');

  Attributes = require('./attributes');

  Label = require('./folder').Label;

  Folder = require('./folder').Folder;

  module.exports = Message = (function(superClass) {
    extend(Message, superClass);

    Message.collectionName = 'messages';

    Message.attributes = _.extend({}, RestfulModel.attributes, {
      'to': Attributes.Collection({
        modelKey: 'to',
        itemClass: Contact
      }),
      'cc': Attributes.Collection({
        modelKey: 'cc',
        itemClass: Contact
      }),
      'bcc': Attributes.Collection({
        modelKey: 'bcc',
        itemClass: Contact
      }),
      'from': Attributes.Collection({
        modelKey: 'from',
        itemClass: Contact
      }),
      'date': Attributes.DateTime({
        queryable: true,
        modelKey: 'date'
      }),
      'body': Attributes.String({
        modelKey: 'body'
      }),
      'files': Attributes.Collection({
        modelKey: 'files',
        itemClass: File
      }),
      'starred': Attributes.Boolean({
        queryable: true,
        modelKey: 'starred'
      }),
      'unread': Attributes.Boolean({
        queryable: true,
        modelKey: 'unread'
      }),
      'snippet': Attributes.String({
        modelKey: 'snippet'
      }),
      'threadId': Attributes.String({
        queryable: true,
        modelKey: 'threadId',
        jsonKey: 'thread_id'
      }),
      'subject': Attributes.String({
        modelKey: 'subject'
      }),
      'draft': Attributes.Boolean({
        modelKey: 'draft',
        jsonKey: 'draft',
        queryable: true
      }),
      'version': Attributes.String({
        modelKey: 'version',
        queryable: true
      }),
      'folder': Attributes.Object({
        modelKey: 'folder',
        itemClass: Folder
      }),
      'labels': Attributes.Collection({
        modelKey: 'labels',
        itemClass: Label
      })
    });

    function Message() {
      this.save = bind(this.save, this);
      Message.__super__.constructor.apply(this, arguments);
      this.body || (this.body = "");
      this.subject || (this.subject = "");
      this.to || (this.to = []);
      this.cc || (this.cc = []);
      this.bcc || (this.bcc = []);
      this;
    }

    Message.prototype.fromJSON = function(json) {
      if (json == null) {
        json = {};
      }
      Message.__super__.fromJSON.call(this, json);
      if (json.object != null) {
        this.draft = json.object === 'draft';
      }
      return this;
    };

    Message.prototype.participants = function() {
      var contact, contacts, i, len, participants, ref, ref1, ref2, ref3, ref4, ref5;
      participants = {};
      contacts = _.union((ref = this.to) != null ? ref : [], (ref1 = this.cc) != null ? ref1 : [], (ref2 = this.from) != null ? ref2 : []);
      for (i = 0, len = contacts.length; i < len; i++) {
        contact = contacts[i];
        if ((contact != null) && ((ref3 = contact.email) != null ? ref3.length : void 0) > 0) {
          if (contact != null) {
            participants[(((ref4 = contact != null ? contact.email : void 0) != null ? ref4 : "").toLowerCase().trim()) + " " + (((ref5 = contact != null ? contact.name : void 0) != null ? ref5 : "").toLowerCase().trim())] = contact;
          }
        }
      }
      return _.values(participants);
    };

    Message.prototype.fileIds = function() {
      return _.map(this.files, function(file) {
        return file.id;
      });
    };

    Message.prototype.saveRequestBody = function() {
      var json, label;
      if (this.constructor.name === 'Draft') {
        return Message.__super__.saveRequestBody.apply(this, arguments);
      }
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

    Message.prototype.save = function(params, callback) {
      if (params == null) {
        params = {};
      }
      if (callback == null) {
        callback = null;
      }
      return this._save(params, callback);
    };

    return Message;

  })(RestfulModel);

}).call(this);
