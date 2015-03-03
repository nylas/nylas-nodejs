_ = require 'underscore'
Promise = require 'bluebird'

File = require './file'
Message = require './message'
Contact = require './contact'
Attributes = require './attributes'

module.exports =
class Draft extends Message

  @collectionName: 'drafts'

  save: (callback = null) ->
    @connection.request
      method: if @id then 'PUT' else 'POST'
      body: @toJSON()
      path: if @id then "/n/#{@namespaceId}/drafts/#{@id}" else "/n/#{@namespaceId}/drafts"
    .then (json) =>
      @fromJSON(json)
      callback(null, @) if callback
      Promise.resolve(@)
    .catch (err) ->
      callback(err) if callback
      Promise.reject(err)

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
