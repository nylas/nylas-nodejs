(function() {
  var Attributes, ManagementAccount, RestfulModel, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  Attributes = require('./attributes');

  _ = require('underscore');

  module.exports = ManagementAccount = (function(superClass) {
    extend(ManagementAccount, superClass);

    function ManagementAccount() {
      return ManagementAccount.__super__.constructor.apply(this, arguments);
    }

    ManagementAccount.collectionName = 'accounts';

    ManagementAccount.attributes = _.extend({}, RestfulModel.attributes, {
      'billingState': Attributes.String({
        modelKey: 'billingState',
        jsonKey: 'billing_state'
      }),
      'namespaceId': Attributes.String({
        modelKey: 'namespaceId',
        jsonKey: 'namespace_id'
      }),
      'syncState': Attributes.String({
        modelKey: 'syncState',
        jsonKey: 'sync_state'
      }),
      'trial': Attributes.Boolean({
        modelKey: 'trial'
      })
    });

    return ManagementAccount;

  })(RestfulModel);

}).call(this);
