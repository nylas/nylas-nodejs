RestfulModel = require './restful-model'
Attributes = require './attributes'
_ = require 'underscore'

module.exports =
class Account extends RestfulModel
  @collectionName: 'accounts'
  @endpointName: 'account'

  @attributes: _.extend {}, RestfulModel.attributes,
    'name': Attributes.String
      modelKey: 'name'

    'emailAddress': Attributes.String
      modelKey: 'emailAddress'
      jsonKey: 'email_address'

    'provider': Attributes.String
      modelKey: 'provider'

    'organizationUnit': Attributes.String
      modelKey: 'organizationUnit'
      jsonKey: 'organization_unit'

    'syncState': Attributes.String
      modelKey: 'syncState'
      jsonKey: 'sync_state'
