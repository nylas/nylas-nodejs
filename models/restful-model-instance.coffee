Promise = require 'bluebird'

module.exports =
class RestfulModelInstance

  constructor: (@modelClass, @connection) ->
    throw new Error("Connection object not provided") unless @connection instanceof require '../nylas-connection'
    throw new Error("Model class not provided") unless @modelClass
    @

  path: ->
    "/#{@modelClass.endpointName}"

  get: ->
    @connection.request
      method: 'GET'
      path: @path()
    .then (json) =>
      model = new @modelClass(@connection, json)
      Promise.resolve(model)
