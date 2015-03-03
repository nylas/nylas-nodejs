async = require 'async'
RestfulModelCollection = require './restful-model-collection'

module.exports =
class ManagementModelCollection extends RestfulModelCollection

  path: ->
    "/a/#{@api.appId}/accounts"
