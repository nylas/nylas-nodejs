(function() {
  var Nylas, NylasConnection, Promise, _, request;

  _ = require('underscore');

  request = require('request');

  Promise = require('bluebird');

  NylasConnection = require('./nylas-connection');

  Nylas = (function() {
    function Nylas() {}

    Nylas.appId = null;

    Nylas.appSecret = null;

    Nylas.apiServer = 'https://api.nylas.com';

    Nylas.config = function(arg) {
      var apiServer, appId, appSecret, ref;
      ref = arg != null ? arg : {}, appId = ref.appId, appSecret = ref.appSecret, apiServer = ref.apiServer;
      if ((apiServer != null ? apiServer.indexOf('://') : void 0) === -1) {
        throw new Error("Please specify a fully qualified URL for the API Server.");
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
      return this;
    };

    Nylas.hostedAPI = function() {
      return (this.appId != null) && (this.appSecret != null);
    };

    Nylas["with"] = function(accessToken) {
      var hosted;
      if (accessToken == null) {
        throw new Error("This function requires an access token");
      }
      return new NylasConnection(accessToken, hosted = this.hostedAPI);
    };

    Nylas.exchangeCodeForToken = function(code, callback) {
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
            url: _this.apiServer + "/oauth/token",
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

    Nylas.urlForAuthentication = function(options) {
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
      return this.apiServer + "/oauth/authorize?client_id=" + this.appId + "&trial=" + options.trial + "&response_type=code&scope=email&login_hint=" + options.loginHint + "&redirect_uri=" + options.redirectURI;
    };

    return Nylas;

  })();

  module.exports = Nylas;

}).call(this);
