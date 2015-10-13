(function() {
  var ManagementModelCollection, RestfulModelCollection,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModelCollection = require('./restful-model-collection');

  module.exports = ManagementModelCollection = (function(superClass) {
    extend(ManagementModelCollection, superClass);

    function ManagementModelCollection(modelClass, connection, appId) {
      this.appId = appId;
      ManagementModelCollection.__super__.constructor.call(this, modelClass, connection);
    }

    ManagementModelCollection.prototype.path = function() {
      return "/a/" + this.appId + "/" + this.modelClass.collectionName;
    };

    return ManagementModelCollection;

  })(RestfulModelCollection);

}).call(this);
