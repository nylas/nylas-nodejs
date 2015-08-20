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

    Account.collectionName = 'accounts';

    Account.attributes = _.extend({}, RestfulModel.attributes, {
      'accountId': Attributes.String({
        modelKey: 'accountId',
        jsonKey: 'account_id'
      }),
      'emailAddress': Attributes.String({
        modelKey: 'emailAddres',
        jsonKey: 'email_address'
      }),
      'id': Attributes.String({
        modelKey: 'id',
        jsonKey: 'id'
      }),
      'name': Attributes.String({
        modelKey: 'name',
        jsonKey: 'name'
      }),
      'organizationUnit': Attributes.String({
        modelKey: 'organizationUnit',
        jsonKey: 'organization_unit'
      }),
      'provider': Attributes.String({
        modelKey: 'provider',
        jsonKey: 'provider'
      })
    });

    return Account;

  })(RestfulModel);

}).call(this);
