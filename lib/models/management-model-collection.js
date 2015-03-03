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
