RestfulModel = require './restful-model'
Attributes = require './attributes'
_ = require 'underscore'

module.exports =
class Calendar extends RestfulModel

  @collectionName: 'calendars'

  @attributes: _.extend {}, RestfulModel.attributes,
    'name': Attributes.String
      modelKey: 'name'
    'description': Attributes.String
      modelKey: 'description'
    'readOnly': Attributes.Boolean
      modelKey: 'readOnly'
      jsonKey: 'read_only'
