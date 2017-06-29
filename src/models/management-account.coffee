RestfulModel = require './restful-model'
Attributes = require './attributes'
_ = require 'underscore'

module.exports =
class ManagementAccount extends RestfulModel
  @collectionName: 'accounts'
  @attributes: _.extend {}, RestfulModel.attributes,

    'billingState': Attributes.String
      modelKey: 'billingState'
      jsonKey: 'billing_state'

    'namespaceId': Attributes.String
      modelKey: 'namespaceId'
      jsonKey: 'namespace_id'

    'syncState': Attributes.String
      modelKey: 'syncState'
      jsonKey: 'sync_state'

    'trial': Attributes.Boolean
      modelKey: 'trial'
