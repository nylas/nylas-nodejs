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
