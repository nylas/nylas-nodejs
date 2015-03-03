RestfulModel = require './restful-model'
Attributes = require './attributes'
_ = require 'underscore'

module.exports =
class Contact extends RestfulModel

  @collectionName: 'contacts'

  @attributes: _.extend {}, RestfulModel.attributes,
    'name': Attributes.String
      modelKey: 'name'

    'email': Attributes.String
      modelKey: 'email'

  toJSON: ->
    json = super
    json['name'] ||= json['email']
    json
