async = require 'async'

RestfulModelCollection = require './restful-model-collection'

module.exports =
class ManagementModelCollection extends RestfulModelCollection

  path: ->
    Nylas = require '../nylas'
    "/a/#{Nylas.appId}/accounts"
