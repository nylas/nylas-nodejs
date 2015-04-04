(function() {
  var NylasConnection, Promise, _, request;

  _ = require('underscore');

  request = require('request');

  Promise = require('bluebird');

  module.exports = NylasConnection = (function() {
    function NylasConnection(accessToken) {
      var Account, ManagementModelCollection, Namespace, RestfulModelCollection;
      this.accessToken = accessToken;
      Namespace = require('./models/namespace');
      RestfulModelCollection = require('./models/restful-model-collection');
      Account = require('./models/account');
      ManagementModelCollection = require('./models/management-model-collection');
      this.namespaces = new RestfulModelCollection(Namespace, this, null);
      this.accounts = new ManagementModelCollection(Account, this, null);
    }

    NylasConnection.prototype.request = function(options) {
      var Nylas;
      if (options == null) {
        options = {};
      }
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

    return NylasConnection;

  })();

}).call(this);
