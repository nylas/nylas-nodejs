_ = require 'underscore'
Promise = require 'bluebird'

File = require './file'
Message = require './message'
Contact = require './contact'
Attributes = require './attributes'

module.exports =
class Draft extends Message

  @collectionName: 'drafts'

  toJSON: ->
    json = super
    json.file_ids = @fileIds()
    json.object = 'draft' if @draft
    json

  save: (params = {}, callback = null) =>
    this._save(params, callback)

  send: (callback = null) ->
    if @id
      body =
        'draft_id': @id
        'version': @version
    else
      body = @toJSON()

    @connection.request
      method: 'POST'
      body: body
      path: "/n/#{@namespaceId}/send"
    .then (json) =>
      @fromJSON(json)
      callback(null, @) if callback
      Promise.resolve(@)
    .catch (err) ->
      callback(err) if callback
      Promise.reject(err)
