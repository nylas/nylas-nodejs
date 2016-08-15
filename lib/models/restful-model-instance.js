(function() {
  var Promise, RestfulModelInstance;

  Promise = require('bluebird');

  module.exports = RestfulModelInstance = (function() {
    function RestfulModelInstance(modelClass, connection) {
      this.modelClass = modelClass;
      this.connection = connection;
      if (!(this.connection instanceof require('../nylas-connection'))) {
        throw new Error("Connection object not provided");
      }
      if (!this.modelClass) {
        throw new Error("Model class not provided");
      }
      this;
    }

    RestfulModelInstance.prototype.path = function() {
      return "/" + this.modelClass.endpointName;
    };

    RestfulModelInstance.prototype.get = function(params) {
      if (params == null) {
        params = {};
      }
      return this.connection.request({
        method: 'GET',
        path: this.path(),
        qs: params
      }).then((function(_this) {
        return function(json) {
          var model;
          model = new _this.modelClass(_this.connection, json);
          return Promise.resolve(model);
        };
      })(this));
    };

    return RestfulModelInstance;

  })();

}).call(this);
