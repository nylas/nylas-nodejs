Attributes = require './attributes'
Promise = require 'bluebird'

module.exports =
class RestfulModel

  @attributes:
    'id': Attributes.String
      modelKey: 'id'

    'object': Attributes.String
      modelKey: 'object'

    'namespaceId': Attributes.String
      modelKey: 'namespaceId'
      jsonKey: 'namespace_id'

  constructor: (@connection, @namespaceId = null, json = null) ->
    throw new Error("Connection object not provided") unless @connection instanceof require '../nylas-connection'
    @fromJSON(json) if json
    @

  attributes: ->
    @constructor.attributes

  isEqual: (other) ->
    other?.id == @id && other?.constructor == @constructor

  fromJSON: (json) ->
    for key, attr of @attributes()
      @[key] = attr.fromJSON(json[attr.jsonKey], @) unless json[attr.jsonKey] is undefined
    @

  toJSON: ->
    json = {}
    json[attr.jsonKey] = attr.toJSON(@[key]) for key, attr of @attributes()
    json['object'] = @constructor.name.toLowerCase()
    json

  toString: ->
    JSON.stringify(@toJSON())
