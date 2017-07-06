RestfulModel = require './restful-model'
Attributes = require './attributes'
Promise = require 'bluebird'
_ = require 'underscore'

class Label extends RestfulModel

  @collectionName: 'labels'

  @attributes: _.extend {}, RestfulModel.attributes,
    'displayName': Attributes.String
      modelKey: 'displayName'
      jsonKey: 'display_name'

    'name': Attributes.String
      modelKey: 'name'
      jsonKey: 'name'

  saveRequestBody: ->
    json = {}
    json['display_name'] = @displayName
    json['name'] = @name
    json

  save: (params = {}, callback = null) ->
    this._save(params, callback)

class Folder extends Label
  @collectionName: 'folders'

module.exports.Label = Label
module.exports.Folder = Folder
