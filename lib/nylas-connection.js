(function() {
  var APIAccount, Account, Attributes, Calendar, Contact, Delta, Draft, Event, File, Folder, Label, ManagementModelCollection, Message, NylasConnection, Promise, RestfulModel, RestfulModelCollection, Tag, Thread, _, clone, request;

  _ = require('underscore');

  clone = require('clone');

  request = require('request');

  Promise = require('bluebird');

  RestfulModel = require('./models/restful-model');

  RestfulModelCollection = require('./models/restful-model-collection');

  Account = require('./models/account');

  APIAccount = require('./models/api_account');

  ManagementModelCollection = require('./models/management-model-collection');

  Thread = require('./models/thread');

  Contact = require('./models/contact');

  Message = require('./models/message');

  Draft = require('./models/draft');

  File = require('./models/file');

  Calendar = require('./models/calendar');

  Event = require('./models/event');

  Tag = require('./models/tag');

  Delta = require('./models/delta');

  Label = require('./models/folder').Label;

  Folder = require('./models/folder').Folder;

  Attributes = require('./models/attributes');

  module.exports = NylasConnection = (function() {
    function NylasConnection(accessToken, hosted) {
      this.accessToken = accessToken;
      if (hosted == null) {
        hosted = true;
      }
      this.threads = new RestfulModelCollection(Thread, this);
      this.contacts = new RestfulModelCollection(Contact, this);
      this.messages = new RestfulModelCollection(Message, this);
      this.drafts = new RestfulModelCollection(Draft, this);
      this.files = new RestfulModelCollection(File, this);
      this.calendars = new RestfulModelCollection(Calendar, this);
      this.events = new RestfulModelCollection(Event, this);
      this.tags = new RestfulModelCollection(Tag, this);
      this.deltas = new Delta(this);
      this.labels = new RestfulModelCollection(Label, this);
      this.folders = new RestfulModelCollection(Folder, this);
      this.usingHostedAPI = hosted;
      if (this.usingHostedAPI) {
        this.accounts = new ManagementModelCollection(Account, this, null);
      } else {
        this.accounts = new RestfulModelCollection(APIAccount, this);
      }
    }

    NylasConnection.prototype.usingHostedAPI = function() {};

    NylasConnection.prototype.requestOptions = function(options) {
      var Nylas;
      if (options == null) {
        options = {};
      }
      options = clone(options);
      Nylas = require('./nylas');
      if (options.method == null) {
        options.method = 'GET';
      }
      if (options.path) {
        if (options.url == null) {
          options.url = "" + Nylas.apiServer + options.path;
        }
      }
      if (!options.formData) {
        if (options.body == null) {
          options.body = {};
        }
      }
      if (options.json == null) {
        options.json = true;
      }
      if (this.accessToken) {
        options.auth = {
          'user': this.accessToken,
          'pass': '',
          'sendImmediately': true
        };
      }
      return options;
    };

    NylasConnection.prototype.request = function(options) {
      if (options == null) {
        options = {};
      }
      options = this.requestOptions(options);
      return new Promise(function(resolve, reject) {
        return request(options, function(error, response, body) {
          if (error || response.statusCode > 299) {
            if (error == null) {
              error = new Error(body.message);
            }
            return reject(error);
          } else {
            try {
              if (_.isString(body)) {
                body = JSON.parse(body);
              }
              return resolve(body);
            } catch (_error) {
              error = _error;
              return reject(error);
            }
          }
        });
      });
    };

    return NylasConnection;

  })();

}).call(this);
