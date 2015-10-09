RestfulModelCollection = require './restful-model-collection'

module.exports =
class ManagementModelCollection extends RestfulModelCollection

  constructor: (modelClass, connection, @appId) ->
    super(modelClass, connection)

  path: ->
    "/a/#{@appId}/#{@modelClass.collectionName}"
