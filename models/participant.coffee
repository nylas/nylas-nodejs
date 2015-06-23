RestfulModel = require './restful-model'
Attributes = require './attributes'
_ = require 'underscore'

module.exports =
class Participant extends RestfulModel

  @collectionName: 'participants'

  @attributes:
    'name': Attributes.String
      modelKey: 'name'

    'email': Attributes.String
      modelKey: 'email'

    'status': Attributes.String
      modelKey: 'status'

  toJSON: ->
    json = super
    json['name'] ||= json['email']
    delete json['object']
    json
