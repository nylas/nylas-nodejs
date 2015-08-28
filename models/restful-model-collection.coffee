async = require 'async'
_ = require 'underscore'
Promise = require 'bluebird'

REQUEST_CHUNK_SIZE = 100

module.exports =
class RestfulModelCollection

  constructor: (@modelClass, @connection) ->
    throw new Error("Connection object not provided") unless @connection instanceof require '../nylas-connection'
    throw new Error("Model class not provided") unless @modelClass
    @

  forEach: (params = {}, eachCallback, completeCallback = null) ->
    offset = 0
    finished = false

    async.until ->
      finished
    , (callback) =>
      @getModelCollection(params, offset, REQUEST_CHUNK_SIZE).then (models) ->
        eachCallback(model) for model in models
        offset += models.length
        finished = models.length < REQUEST_CHUNK_SIZE
        callback()
    , (err) ->
      completeCallback() if completeCallback

  count: (params = {}, callback = null) ->
    @connection.request
      method: 'GET'
      path: @path()
      qs: _.extend {view: 'count'}, params
    .then (json) ->
      callback(null, json.count) if callback
      Promise.resolve(json.count)
    .catch (err) ->
      callback(err) if callback
      Promise.reject(err)

  first: (params = {}, callback = null) ->
    @getModelCollection(params, 0, 1).then (items) ->
      callback(null, items[0]) if callback
      Promise.resolve(items[0])
    .catch (err) ->
      callback(err) if callback
      Promise.reject(err)

  list: (params = {}, callback = null) ->
    limit = Infinity
    if 'limit' of params
        limit = params['limit']

    @range(params, 0, limit, callback)

  find: (id, callback = null) ->
    if not id
      err = new Error("find() must be called with an item id")
      callback(err) if callback
      return Promise.reject(err)

    @getModel(id).then (model) ->
      callback(null, model) if callback
      Promise.resolve(model)
    .catch (err) ->
      callback(err) if callback
      Promise.reject(err)

  range: (params = {}, offset = 0, limit = 100, callback = null) ->
    new Promise (resolve, reject) =>
      accumulated = []
      finished = false

      async.until ->
        finished
      , (chunkCallback) =>
        chunkOffset = offset + accumulated.length
        chunkLimit = Math.min(REQUEST_CHUNK_SIZE, limit - accumulated.length)
        @getModelCollection(params, chunkOffset, chunkLimit).then (models) ->
          accumulated = accumulated.concat(models)
          finished = models.length < REQUEST_CHUNK_SIZE or accumulated.length >= limit
          chunkCallback()
      , (err) ->
        if err
          callback(err) if callback
          reject(err)
        else
          callback(null, accumulated) if callback
          resolve(accumulated)

  delete: (itemOrId, params = {}, callback = null) ->
    id = if itemOrId?.id? then itemOrId.id else itemOrId
    if _.isFunction(params)
      callback = params
      params = {}
    @connection.request
      method: 'DELETE'
      qs: params
      path: "#{@path()}/#{id}"
    .then ->
      callback(null) if callback
      Promise.resolve()
    .catch (err) ->
      callback(err) if callback
      Promise.reject(err)

  build: (args) ->
    model = new @modelClass(@connection)
    model[key] = val for key, val of args
    model

  path: ->
    "/#{@modelClass.collectionName}"

  # Internal

  getModel: (id) ->
    @connection.request
      method: 'GET'
      path: "#{@path()}/#{id}"
    .then (json) =>
      model = new @modelClass(@connection, json)
      Promise.resolve(model)

  getModelCollection: (params, offset, limit) ->
    @connection.request
      method: 'GET'
      path: @path()
      qs: _.extend {}, params, {offset, limit}
    .then (jsonArray) =>
      models = jsonArray.map (json) =>
        new @modelClass(@connection, json)
      Promise.resolve(models)

