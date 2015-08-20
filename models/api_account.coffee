RestfulModel = require './restful-model'
Attributes = require './attributes'
_ = require 'underscore'

module.exports =
class Account extends RestfulModel
  @collectionName: 'accounts'
  @attributes: _.extend {}, RestfulModel.attributes,
    'accountId': Attributes.String
      modelKey: 'accountId'
      jsonKey: 'account_id'

    'emailAddress': Attributes.String
      modelKey: 'emailAddres'
      jsonKey: 'email_address'

    'id': Attributes.String
      modelKey: 'id'
      jsonKey: 'id'

    'name': Attributes.String
      modelKey: 'name'
      jsonKey: 'name'

    'organizationUnit': Attributes.String
      modelKey: 'organizationUnit'
      jsonKey: 'organization_unit'

    'provider': Attributes.String
      modelKey: 'provider'
      jsonKey: 'provider'
