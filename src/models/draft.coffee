_ = require 'underscore'
Promise = require 'bluebird'

File = require './file'
Message = require './message'
Contact = require './contact'
Attributes = require './attributes'

module.exports =
class Draft extends Message

  @collectionName: 'drafts'

  @attributes: _.extend {}, Message.attributes,
      'replyToMessageId': Attributes.String
        modelKey: 'replyToMessageId'
        jsonKey: 'reply_to_message_id'

  toJSON: ->
    json = super
    json.file_ids = @fileIds()
    json.object = 'draft' if @draft
    json

  save: (params = {}, callback = null) =>
    this._save(params, callback)

  saveRequestBody: ->
    super

  send: (callback = null) ->
    if @id
      body =
        'draft_id': @id
        'version': @version
    else
      body = @saveRequestBody()

    @connection.request
      method: 'POST'
      body: body
      path: "/send"
    .then (json) =>
      @fromJSON(json)
      callback(null, @) if callback
      Promise.resolve(@)
    .catch (err) ->
      callback(err) if callback
      Promise.reject(err)
