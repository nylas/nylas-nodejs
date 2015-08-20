Attributes = require './attributes'
Promise = require 'bluebird'
_ = require 'underscore'

module.exports =
class RestfulModel

  @attributes:
    'id': Attributes.String
      modelKey: 'id'

    'object': Attributes.String
      modelKey: 'object'

    'accountId': Attributes.String
      modelKey: 'account_id'

  constructor: (@connection, json = null) ->
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

  # saveRequestBody is used by save(). It returns a JSON dict containing only the
  # fields the API allows updating. Subclasses should override this method.
  saveRequestBody: ->
    @toJSON()

  toString: ->
    JSON.stringify(@toJSON())

  # Not every model needs to have a save function, but those who
  # do shouldn't have to reimplement the same boilerplate.
  # They should instead define a save() function which calls _save.
  _save: (params = {}, callback = null) ->
    if _.isFunction(params)
      callback = params
      params = {}

    @connection.request
      method: if @id then 'PUT' else 'POST'
      body: @saveRequestBody()
      qs: params
      path: if @id then "/#{@constructor.collectionName}/#{@id}" else "/#{@constructor.collectionName}"
    .then (json) =>
      @fromJSON(json)
      callback(null, @) if callback
      Promise.resolve(@)
    .catch (err) ->
      callback(err) if callback
      Promise.reject(err)
