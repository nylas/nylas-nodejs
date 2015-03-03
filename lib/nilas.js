(function() {
  module.exports = function(grunt) {
    grunt.initConfig({
      coffee: {
        compile: {
          files: {
            'lib/nilas.js': ['*.coffee', 'models/*.coffee']
          }
        }
      },
      jasmine_node: {
        coffee: 'true',
        extensions: 'coffee'
      }
    });
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-jasmine-node-coffee');
    return grunt.registerTask('default', ['coffee', 'jasmine_node']);
  };

}).call(this);

(function() {
  var APIError,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  APIError = (function(superClass) {
    extend(APIError, superClass);

    function APIError(arg) {
      var ref, ref1, ref2, ref3, ref4, ref5;
      ref = arg != null ? arg : {}, this.error = ref.error, this.response = ref.response, this.body = ref.body, this.requestOptions = ref.requestOptions, this.statusCode = ref.statusCode;
      if (this.statusCode == null) {
        this.statusCode = (ref1 = this.response) != null ? ref1.statusCode : void 0;
      }
      this.name = "APIError";
      this.message = (ref2 = (ref3 = (ref4 = this.body) != null ? ref4.message : void 0) != null ? ref3 : this.body) != null ? ref2 : (ref5 = this.error) != null ? typeof ref5.toString === "function" ? ref5.toString() : void 0 : void 0;
    }

    APIError.prototype.notifyConsole = function() {
      return console.error("Edgehill API Error: " + this.message, this);
    };

    return APIError;

  })(Error);

  module.exports = {
    "APIError": APIError
  };

}).call(this);

(function() {
  var NilasConnection, Promise, _, request;

  _ = require('underscore');

  request = require('request');

  Promise = require('bluebird');

  module.exports = NilasConnection = (function() {
    function NilasConnection(accessToken) {
      var Account, ManagementModelCollection, Namespace, RestfulModelCollection;
      this.accessToken = accessToken;
      Namespace = require('./models/namespace');
      RestfulModelCollection = require('./models/restful-model-collection');
      Account = require('./models/account');
      ManagementModelCollection = require('./models/management-model-collection');
      this.namespaces = new RestfulModelCollection(Namespace, this, null);
      this.accounts = new ManagementModelCollection(Account, this, null);
    }

    NilasConnection.prototype.request = function(options) {
      var Nilas;
      if (options == null) {
        options = {};
      }
      Nilas = require('./nilas');
      if (options.method == null) {
        options.method = 'GET';
      }
      if (options.path) {
        if (options.url == null) {
          options.url = "" + Nilas.apiServer + options.path;
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
      console.log(JSON.stringify(options));
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

    return NilasConnection;

  })();

}).call(this);

(function() {
  var Nilas, NilasConnection, Promise, _, request;

  _ = require('underscore');

  request = require('request');

  Promise = require('bluebird');

  NilasConnection = require('./nilas-connection');

  Nilas = (function() {
    function Nilas() {}

    Nilas.appId = null;

    Nilas.appSecret = null;

    Nilas.apiServer = 'https://api.nilas.com';

    Nilas.authServer = 'https://www.nilas.com';

    Nilas.config = function(arg) {
      var apiServer, appId, appSecret, authServer, ref;
      ref = arg != null ? arg : {}, appId = ref.appId, appSecret = ref.appSecret, apiServer = ref.apiServer, authServer = ref.authServer;
      if ((apiServer != null ? apiServer.indexOf('://') : void 0) === -1) {
        throw new Error("Please specify a fully qualified URL for the API Server.");
      }
      if ((authServer != null ? authServer.indexOf('://') : void 0) === -1) {
        throw new Error("Please specify a fully qualified URL for the Auth Server.");
      }
      if (appId) {
        this.appId = appId;
      }
      if (appSecret) {
        this.appSecret = appSecret;
      }
      if (apiServer) {
        this.apiServer = apiServer;
      }
      if (authServer) {
        this.authServer = authServer;
      }
      return this;
    };

    Nilas["with"] = function(accessToken) {
      if (!(this.appId && this.appSecret)) {
        throw new Error("with() cannot be called until you provide an appId and secret via config()");
      }
      if (accessToken == null) {
        throw new Error("with() must be called with an access token");
      }
      return new NilasConnection(accessToken);
    };

    Nilas.exchangeCodeForToken = function(code, callback) {
      if (!(this.appId && this.appSecret)) {
        throw new Error("exchangeCodeForToken() cannot be called until you provide an appId and secret via config()");
      }
      if (code == null) {
        throw new Error("exchangeCodeForToken() must be called with a code");
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var options;
          options = {
            method: 'GET',
            json: true,
            url: _this.authServer + "/oauth/token",
            qs: {
              'client_id': _this.appId,
              'client_secret': _this.appSecret,
              'grant_type': 'authorization_code',
              'code': code
            }
          };
          return request(options, function(error, response, body) {
            if (error) {
              reject(error);
              if (callback) {
                return callback(error);
              }
            } else {
              resolve(body['access_token']);
              if (callback) {
                return callback(null, body['access_token']);
              }
            }
          });
        };
      })(this));
    };

    Nilas.urlForAuthentication = function(options) {
      if (options == null) {
        options = {};
      }
      if (!(this.appId && this.appSecret)) {
        throw new Error("urlForAuthentication() cannot be called until you provide an appId and secret via config()");
      }
      if (options.redirectURI == null) {
        throw new Error("urlForAuthentication() requires options.redirectURI");
      }
      if (options.loginHint == null) {
        options.loginHint = '';
      }
      if (options.trial == null) {
        options.trial = false;
      }
      return this.authServer + "/oauth/authorize?client_id=" + this.appId + "&trial=" + options.trial + "&response_type=code&scope=email&login_hint=" + options.loginHint + "&redirect_uri=" + options.redirectURI;
    };

    return Nilas;

  })();

  module.exports = Nilas;

}).call(this);

(function() {
  var Account, Attributes, RestfulModel, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  Attributes = require('./attributes');

  _ = require('underscore');

  module.exports = Account = (function(superClass) {
    extend(Account, superClass);

    function Account() {
      return Account.__super__.constructor.apply(this, arguments);
    }

    return Account;

  })(RestfulModel);

}).call(this);

(function() {
  var Attribute, AttributeBoolean, AttributeCollection, AttributeDateTime, AttributeNumber, AttributeString,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Attribute = (function() {
    function Attribute(arg) {
      var jsonKey, modelKey, queryable;
      modelKey = arg.modelKey, queryable = arg.queryable, jsonKey = arg.jsonKey;
      this.modelKey = modelKey;
      this.jsonKey = jsonKey || modelKey;
      this.queryable = queryable;
      this;
    }

    Attribute.prototype.toJSON = function(val) {
      return val;
    };

    Attribute.prototype.fromJSON = function(val, parent) {
      return val || null;
    };

    return Attribute;

  })();

  AttributeNumber = (function(superClass) {
    extend(AttributeNumber, superClass);

    function AttributeNumber() {
      return AttributeNumber.__super__.constructor.apply(this, arguments);
    }

    AttributeNumber.prototype.toJSON = function(val) {
      return val;
    };

    AttributeNumber.prototype.fromJSON = function(val, parent) {
      if (!isNaN(val)) {
        return Number(val);
      } else {
        return null;
      }
    };

    return AttributeNumber;

  })(Attribute);

  AttributeBoolean = (function(superClass) {
    extend(AttributeBoolean, superClass);

    function AttributeBoolean() {
      return AttributeBoolean.__super__.constructor.apply(this, arguments);
    }

    AttributeBoolean.prototype.toJSON = function(val) {
      return val;
    };

    AttributeBoolean.prototype.fromJSON = function(val, parent) {
      return (val === 'true' || val === true) || false;
    };

    return AttributeBoolean;

  })(Attribute);

  AttributeString = (function(superClass) {
    extend(AttributeString, superClass);

    function AttributeString() {
      return AttributeString.__super__.constructor.apply(this, arguments);
    }

    AttributeString.prototype.toJSON = function(val) {
      return val;
    };

    AttributeString.prototype.fromJSON = function(val, parent) {
      return val || "";
    };

    return AttributeString;

  })(Attribute);

  AttributeDateTime = (function(superClass) {
    extend(AttributeDateTime, superClass);

    function AttributeDateTime() {
      return AttributeDateTime.__super__.constructor.apply(this, arguments);
    }

    AttributeDateTime.prototype.toJSON = function(val) {
      if (!val) {
        return null;
      }
      if (!(val instanceof Date)) {
        throw new Error("Attempting to toJSON AttributeDateTime which is not a date: " + this.modelKey + " = " + val);
      }
      return val.getTime() / 1000.0;
    };

    AttributeDateTime.prototype.fromJSON = function(val, parent) {
      if (!val) {
        return null;
      }
      return new Date(val * 1000);
    };

    return AttributeDateTime;

  })(Attribute);

  AttributeCollection = (function(superClass) {
    extend(AttributeCollection, superClass);

    function AttributeCollection(arg) {
      var itemClass, jsonKey, modelKey;
      modelKey = arg.modelKey, jsonKey = arg.jsonKey, itemClass = arg.itemClass;
      AttributeCollection.__super__.constructor.apply(this, arguments);
      this.itemClass = itemClass;
      this;
    }

    AttributeCollection.prototype.toJSON = function(vals) {
      var i, json, len, val;
      if (!vals) {
        return [];
      }
      json = [];
      for (i = 0, len = vals.length; i < len; i++) {
        val = vals[i];
        if (val.toJSON != null) {
          json.push(val.toJSON());
        } else {
          json.push(val);
        }
      }
      return json;
    };

    AttributeCollection.prototype.fromJSON = function(json, parent) {
      var i, len, obj, objJSON, objs;
      if (!(json && json instanceof Array)) {
        return [];
      }
      objs = [];
      for (i = 0, len = json.length; i < len; i++) {
        objJSON = json[i];
        obj = new this.itemClass(parent.connection, parent.namespaceId, objJSON);
        objs.push(obj);
      }
      return objs;
    };

    return AttributeCollection;

  })(Attribute);

  module.exports = {
    Number: function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(AttributeNumber, arguments, function(){});
    },
    String: function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(AttributeString, arguments, function(){});
    },
    DateTime: function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(AttributeDateTime, arguments, function(){});
    },
    Collection: function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(AttributeCollection, arguments, function(){});
    },
    Boolean: function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(AttributeBoolean, arguments, function(){});
    },
    Object: function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Attribute, arguments, function(){});
    },
    AttributeNumber: AttributeNumber,
    AttributeString: AttributeString,
    AttributeDateTime: AttributeDateTime,
    AttributeCollection: AttributeCollection,
    AttributeBoolean: AttributeBoolean
  };

}).call(this);

(function() {
  var Attributes, Calendar, RestfulModel, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  Attributes = require('./attributes');

  _ = require('underscore');

  module.exports = Calendar = (function(superClass) {
    extend(Calendar, superClass);

    function Calendar() {
      return Calendar.__super__.constructor.apply(this, arguments);
    }

    Calendar.collectionName = 'calendars';

    Calendar.attributes = _.extend({}, RestfulModel.attributes, {
      'name': Attributes.String({
        modelKey: 'name'
      }),
      'description': Attributes.String({
        modelKey: 'description'
      })
    });

    return Calendar;

  })(RestfulModel);

}).call(this);

(function() {
  var Attributes, Contact, RestfulModel, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  Attributes = require('./attributes');

  _ = require('underscore');

  module.exports = Contact = (function(superClass) {
    extend(Contact, superClass);

    function Contact() {
      return Contact.__super__.constructor.apply(this, arguments);
    }

    Contact.collectionName = 'contacts';

    Contact.attributes = _.extend({}, RestfulModel.attributes, {
      'name': Attributes.String({
        modelKey: 'name'
      }),
      'email': Attributes.String({
        modelKey: 'email'
      })
    });

    Contact.prototype.toJSON = function() {
      var json;
      json = Contact.__super__.toJSON.apply(this, arguments);
      json['name'] || (json['name'] = json['email']);
      return json;
    };

    return Contact;

  })(RestfulModel);

}).call(this);

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

    Draft.prototype.send = function() {
      var body;
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

(function() {
  var Attributes, Event, RestfulModel, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  Attributes = require('./attributes');

  _ = require('underscore');

  module.exports = Event = (function(superClass) {
    extend(Event, superClass);

    function Event() {
      return Event.__super__.constructor.apply(this, arguments);
    }

    Event.collectionName = 'events';

    Event.attributes = _.extend({}, RestfulModel.attributes, {
      'title': Attributes.String({
        modelKey: 'title'
      }),
      'description': Attributes.String({
        modelKey: 'description'
      }),
      'location': Attributes.String({
        modelKey: 'location'
      }),
      'when': Attributes.Object({
        modelKey: 'when'
      }),
      'start': Attributes.Number({
        modelKey: 'start',
        jsonKey: '_start'
      }),
      'end': Attributes.Number({
        modelKey: 'end',
        jsonKey: '_end'
      })
    });

    Event.prototype.fromJSON = function(json) {
      Event.__super__.fromJSON.call(this, json);
      this.start = this.when.start_time || new Date(this.when.start_date).getTime() / 1000.0 || this.when.time;
      this.end = this.when.end_time || new Date(this.when.end_date).getTime() / 1000.0 + (60 * 60 * 24 - 1) || this.when.time;
      delete this.when.object;
      return this;
    };

    return Event;

  })(RestfulModel);

}).call(this);

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

(function() {
  var ManagementModelCollection, RestfulModelCollection, async,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  async = require('async');

  RestfulModelCollection = require('./restful-model-collection');

  module.exports = ManagementModelCollection = (function(superClass) {
    extend(ManagementModelCollection, superClass);

    function ManagementModelCollection() {
      return ManagementModelCollection.__super__.constructor.apply(this, arguments);
    }

    ManagementModelCollection.prototype.path = function() {
      return "/a/" + this.api.appId + "/accounts";
    };

    return ManagementModelCollection;

  })(RestfulModelCollection);

}).call(this);

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

(function() {
  var Attributes, Calendar, Contact, Draft, Event, File, Message, Namespace, RestfulModel, RestfulModelCollection, Tag, Thread, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  RestfulModelCollection = require('./restful-model-collection');

  Thread = require('./thread');

  Contact = require('./contact');

  Message = require('./message');

  Draft = require('./draft');

  File = require('./file');

  Calendar = require('./calendar');

  Event = require('./event');

  Tag = require('./tag');

  Attributes = require('./attributes');

  _ = require('underscore');

  module.exports = Namespace = (function(superClass) {
    extend(Namespace, superClass);

    Namespace.collectionName = 'n';

    Namespace.attributes = _.extend({}, RestfulModel.attributes, {
      'name': Attributes.String({
        modelKey: 'name'
      }),
      'provider': Attributes.String({
        modelKey: 'provider'
      }),
      'emailAddress': Attributes.String({
        queryable: true,
        modelKey: 'emailAddress',
        jsonKey: 'email_address'
      })
    });

    function Namespace() {
      Namespace.__super__.constructor.apply(this, arguments);
      this.threads = new RestfulModelCollection(Thread, this.connection, this.id);
      this.contacts = new RestfulModelCollection(Contact, this.connection, this.id);
      this.messages = new RestfulModelCollection(Message, this.connection, this.id);
      this.drafts = new RestfulModelCollection(Draft, this.connection, this.id);
      this.files = new RestfulModelCollection(File, this.connection, this.id);
      this.calendars = new RestfulModelCollection(Calendar, this.connection, this.id);
      this.events = new RestfulModelCollection(Event, this.connection, this.id);
      this.tags = new RestfulModelCollection(Tag, this.connection, this.id);
      this;
    }

    Namespace.prototype.me = function() {
      Contact = require('./contact');
      return new Contact({
        namespaceId: this.id,
        name: this.name,
        email: this.emailAddress
      });
    };

    return Namespace;

  })(RestfulModel);

}).call(this);

(function() {
  var Promise, REQUEST_CHUNK_SIZE, RestfulModelCollection, _, async;

  async = require('async');

  _ = require('underscore');

  Promise = require('bluebird');

  REQUEST_CHUNK_SIZE = 100;

  module.exports = RestfulModelCollection = (function() {
    function RestfulModelCollection(modelClass, connection, namespaceId) {
      this.modelClass = modelClass;
      this.connection = connection;
      this.namespaceId = namespaceId;
      if (!(this.connection instanceof require('../nilas-connection'))) {
        throw new Error("Connection object not provided");
      }
      if (!this.modelClass) {
        throw new Error("Model class not provided");
      }
      this;
    }

    RestfulModelCollection.prototype.forEach = function(params, eachCallback, completeCallback) {
      var finished, offset;
      if (params == null) {
        params = {};
      }
      if (completeCallback == null) {
        completeCallback = null;
      }
      offset = 0;
      finished = false;
      return async.until(function() {
        return finished;
      }, (function(_this) {
        return function(callback) {
          return _this.getModelCollection(params, offset, REQUEST_CHUNK_SIZE).then(function(models) {
            var i, len, model;
            for (i = 0, len = models.length; i < len; i++) {
              model = models[i];
              eachCallback(model);
            }
            offset += models.length;
            finished = models.length < REQUEST_CHUNK_SIZE;
            return callback();
          });
        };
      })(this), function(err) {
        if (completeCallback) {
          return completeCallback();
        }
      });
    };

    RestfulModelCollection.prototype.count = function(params, callback) {
      if (params == null) {
        params = {};
      }
      if (callback == null) {
        callback = null;
      }
      return this.connection.request({
        method: 'GET',
        path: this.path(),
        qs: _.extend({
          view: 'count'
        }, params)
      }).then(function(json) {
        if (callback) {
          callback(null, json.count);
        }
        return Promise.resolve(json.count);
      })["catch"](function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
    };

    RestfulModelCollection.prototype.first = function(params, callback) {
      if (params == null) {
        params = {};
      }
      if (callback == null) {
        callback = null;
      }
      return this.getModelCollection(params).then(function(items) {
        if (callback) {
          callback(null, items[0]);
        }
        return Promise.resolve(items[0]);
      })["catch"](function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
    };

    RestfulModelCollection.prototype.list = function(params, callback) {
      if (params == null) {
        params = {};
      }
      if (callback == null) {
        callback = null;
      }
      return this.range(params, 0, Infinity, callback);
    };

    RestfulModelCollection.prototype.find = function(id, callback) {
      var err;
      if (callback == null) {
        callback = null;
      }
      if (!id) {
        err = new Error("find() must be called with an item id");
        if (callback) {
          callback(err);
        }
        Promise.reject(err);
        return;
      }
      return this.getModel(id).then(function(model) {
        if (callback) {
          callback(null, model);
        }
        return Promise.resolve(model);
      })["catch"](function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
    };

    RestfulModelCollection.prototype.range = function(params, offset, limit, callback) {
      if (params == null) {
        params = {};
      }
      if (offset == null) {
        offset = 0;
      }
      if (limit == null) {
        limit = 100;
      }
      if (callback == null) {
        callback = null;
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var accumulated, finished;
          accumulated = [];
          finished = false;
          return async.until(function() {
            return finished;
          }, function(chunkCallback) {
            var chunkLimit, chunkOffset;
            chunkOffset = offset + accumulated.length;
            chunkLimit = Math.min(REQUEST_CHUNK_SIZE, limit - accumulated.length);
            return _this.getModelCollection(params, chunkOffset, chunkLimit).then(function(models) {
              accumulated = accumulated.concat(models);
              finished = models.length < REQUEST_CHUNK_SIZE || accumulated.length >= limit;
              return chunkCallback();
            });
          }, function(err) {
            if (err) {
              if (callback) {
                callback(err);
              }
              return reject(err);
            } else {
              if (callback) {
                callback(null, accumulated);
              }
              return resolve(accumulated);
            }
          });
        };
      })(this));
    };

    RestfulModelCollection.prototype["delete"] = function(itemOrId, callback) {
      var id;
      id = (itemOrId != null ? itemOrId.id : void 0) != null ? itemOrId.id : itemOrId;
      return this.connection.request("DELETE", (this.path()) + "/" + id).then(function() {
        if (callback) {
          callback(null);
        }
        return Promise.resolve();
      })["catch"](function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
    };

    RestfulModelCollection.prototype.build = function(args) {
      var key, model, val;
      model = new this.modelClass(this.connection, this.namespaceId);
      for (key in args) {
        val = args[key];
        model[key] = val;
      }
      return model;
    };

    RestfulModelCollection.prototype.path = function() {
      if (this.namespaceId) {
        return "/n/" + this.namespaceId + "/" + this.modelClass.collectionName;
      } else {
        return "/" + this.modelClass.collectionName;
      }
    };

    RestfulModelCollection.prototype.getModel = function(id) {
      return this.connection.request({
        method: 'GET',
        path: (this.path()) + "/" + id
      }).then((function(_this) {
        return function(json) {
          var model;
          model = new _this.modelClass(_this.connection, _this.namespaceId, json);
          return Promise.resolve(model);
        };
      })(this));
    };

    RestfulModelCollection.prototype.getModelCollection = function(params, offset, limit) {
      return this.connection.request({
        method: 'GET',
        path: this.path(),
        qs: _.extend({}, params, {
          offset: offset,
          limit: limit
        })
      }).then((function(_this) {
        return function(jsonArray) {
          var models;
          models = jsonArray.map(function(json) {
            return new _this.modelClass(_this.connection, _this.namespaceId, json);
          });
          return Promise.resolve(models);
        };
      })(this));
    };

    return RestfulModelCollection;

  })();

}).call(this);

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

(function() {
  var Attributes, RestfulModel, Tag, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  Attributes = require('./attributes');

  _ = require('underscore');

  module.exports = Tag = (function(superClass) {
    extend(Tag, superClass);

    function Tag() {
      return Tag.__super__.constructor.apply(this, arguments);
    }

    Tag.collectionName = 'tags';

    Tag.attributes = _.extend({}, RestfulModel.attributes, {
      'name': Attributes.String({
        modelKey: 'name'
      })
    });

    return Tag;

  })(RestfulModel);

}).call(this);

(function() {
  var Attributes, Contact, RestfulModel, Tag, Thread, _,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore');

  Tag = require('./tag');

  RestfulModel = require('./restful-model');

  Contact = require('./contact');

  Attributes = require('./attributes');

  module.exports = Thread = (function(superClass) {
    extend(Thread, superClass);

    function Thread() {
      this.tagIds = bind(this.tagIds, this);
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
      })
    });

    Thread.prototype.fromJSON = function(json) {
      Thread.__super__.fromJSON.call(this, json);
      this.unread = this.isUnread();
      return this;
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
