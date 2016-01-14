(function() {
  var Promise, SingleRestfulModel;

  Promise = require('bluebird');

  module.exports = SingleRestfulModel = (function() {
    function SingleRestfulModel(modelClass, connection) {
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

    SingleRestfulModel.prototype.path = function() {
      return "/" + this.modelClass.endpointName;
    };

    SingleRestfulModel.prototype.get = function() {
      return this.connection.request({
        method: 'GET',
        path: this.path()
      }).then((function(_this) {
        return function(json) {
          var model;
          model = new _this.modelClass(_this.connection, json);
          return Promise.resolve(model);
        };
      })(this));
    };

    return SingleRestfulModel;

  })();

}).call(this);
