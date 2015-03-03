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
