RestfulModelCollection = require './restful-model-collection'

module.exports =
class ManagementModelCollection extends RestfulModelCollection

  constructor: (modelClass, connection, @appId) ->
    super(modelClass, connection)

  path: ->
    Nylas = require '../nylas'
    "/a/#{@appId}/#{@modelClass.collectionName}"
