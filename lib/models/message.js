(function() {
  var Attributes, Contact, File, Message, RestfulModel, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore');

  File = require('./file');

  RestfulModel = require('./restful-model');

  Contact = require('./contact');

  Attributes = require('./attributes');

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
      })
    });

    function Message() {
      Message.__super__.constructor.apply(this, arguments);
      this.body || (this.body = "");
      this.subject || (this.subject = "");
      this.to || (this.to = []);
      this.cc || (this.cc = []);
      this.bcc || (this.bcc = []);
      this;
    }

    Message.prototype.toJSON = function() {
      var json;
      json = Message.__super__.toJSON.apply(this, arguments);
      json.file_ids = this.fileIds();
      if (this.draft) {
        json.object = 'draft';
      }
      return json;
    };

    Message.prototype.fromJSON = function(json) {
      var file, i, len, ref, ref1;
      if (json == null) {
        json = {};
      }
      Message.__super__.fromJSON.call(this, json);
      if (json.object != null) {
        this.draft = json.object === 'draft';
      }
      ref1 = (ref = this.files) != null ? ref : [];
      for (i = 0, len = ref1.length; i < len; i++) {
        file = ref1[i];
        file.namespaceId = this.namespaceId;
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

    return Message;

  })(RestfulModel);

}).call(this);
