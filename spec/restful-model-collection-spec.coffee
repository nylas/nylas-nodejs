Nilas = require '../nilas'
NilasConnection = require '../nilas-connection'
RestfulModelCollection = require '../models/restful-model-collection'
Thread = require '../models/thread'
Promise = require 'bluebird'
request = require 'request'

testUntil = (fn) ->
  finished = false
  runs ->
    fn (callback) ->
      finished = true
  waitsFor -> finished

describe "RestfulModelCollection", ->
  beforeEach ->
    Nilas.config
      appId: '123'
      appSecret: '123'
    @connection = new NilasConnection('test-access-token')
    @collection = new RestfulModelCollection(Thread, @connection, 'test-namespace-id')

  describe "constructor", ->
    it "should require an inbox connection object", ->
      expect( -> new RestfulModelCollection(Thread)).toThrow()

    it "should require a model class", ->
      expect( -> new RestfulModelCollection(null, @connection)).toThrow()

  describe "forEach", ->
    beforeEach ->
      threadsResponses = []
      for x in [0..3]
        response = []
        count = if x < 3 then 99 else 12
        for i in [0..count]
          response.push({
            id: '123',
            namespace_id: 'test-namespace-id',
            subject: 'A'
          })
        threadsResponses.push(response)

      spyOn(@collection, 'getModelCollection').andCallFake (params, offset, limit) ->
        Promise.resolve(threadsResponses[offset / 100])

    it "should fetch models with the given params", ->
      params = {from: 'ben@nilas.com'}
      threads = [{
        id: '123'
        namespace_id: 'test-namespace-id'
        subject: 'A'
      }]
      @collection.forEach(params, (->), (->))
      expect(@collection.getModelCollection).toHaveBeenCalledWith(params, 0, 100)

    it "should fetch repeatedly until fewer than requested models are returned", ->
      params = {from: 'ben@nilas.com'}
      runs ->
        @collection.forEach(params, (->), (->))
      waitsFor ->
        @collection.getModelCollection.callCount == 4
      runs ->
        expect(@collection.getModelCollection.calls[0].args).toEqual([ { from : 'ben@nilas.com' }, 0, 100 ])
        expect(@collection.getModelCollection.calls[1].args).toEqual([ { from : 'ben@nilas.com' }, 100, 100 ])
        expect(@collection.getModelCollection.calls[2].args).toEqual([ { from : 'ben@nilas.com' }, 200, 100 ])
        expect(@collection.getModelCollection.calls[3].args).toEqual([ { from : 'ben@nilas.com' }, 300, 100 ])

    it "should call eachCallback with each model fetched", ->
      params = {from: 'ben@nilas.com'}
      eachCallCount = 0
      runs ->
        @collection.forEach(params, (-> eachCallCount += 1), (->))
      waitsFor ->
        @collection.getModelCollection.callCount == 4
      runs ->
        expect(eachCallCount).toBe(313)

    it "should call completeCallback when finished", ->
      params = {from: 'ben@nilas.com'}
      doneCallCount = 0
      runs ->
        @collection.forEach(params, (-> ), (-> doneCallCount += 1))
      waitsFor ->
        @collection.getModelCollection.callCount == 4
      runs ->
        expect(doneCallCount).toBe(1)

  describe "count", ->
    it "should make a request with the provided params and view=count", ->
      spyOn(@connection, 'request').andCallFake -> Promise.resolve({})
      @collection.count({from: 'ben@nilas.com'})
      expect(@connection.request).toHaveBeenCalledWith({ method : 'GET', path : '/n/test-namespace-id/threads', qs : { view : 'count', from : 'ben@nilas.com' } })

    describe "when the request is successful", ->
      beforeEach ->
        spyOn(@connection, 'request').andCallFake ->
          Promise.resolve({count: 1023})

      it "should resolve with the count", ->
        testUntil (done) =>
          @collection.count({from: 'ben@nilas.com'}).then (count) ->
            expect(count).toBe(1023)
            done()

      it "should call the optional callback with the count", ->
        testUntil (done) =>
          @collection.count {from: 'ben@nilas.com'}, (callbackError, count) ->
            expect(count).toBe(1023)
            done()

    describe "when the request fails", ->
      beforeEach ->
        @error = new Error("Network error")
        spyOn(@connection, 'request').andCallFake =>
          Promise.reject(@error)

      it "should reject with any error", ->
        testUntil (done) =>
          @collection.count({from: 'ben@nilas.com'}).catch (rejectError) =>
            expect(rejectError).toBe(@error)
            done()

      it "should call the optional callback with any error", ->
        testUntil (done) =>
          @collection.count {from: 'ben@nilas.com'}, (callbackError, count) =>
            expect(callbackError).toBe(@error)
            done()


  first: (params = {}, callback = null) ->
    @getModelCollection(params).then (items) ->
      callback(null, items[0]) if callback
      Promise.resolve(items[0])
    .catch (err) ->
      callback(err) if callback
      Promise.reject(err)

  list: (params = {}, callback = null) ->
    @range(params, 0, Infinity, callback)

  find: (id, callback = null) ->
    if not id
      err = new Error("find() must be called with an item id")
      callback(err) if callback
      Promise.reject(err)
      return

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

  delete: (itemOrId, callback) ->
    id = if itemOrId?.id? then itemOrId.id else itemOrId
    @connection.request("DELETE", "#{@path()}/#{id}").then ->
      callback(null) if callback
      Promise.resolve()
    .catch (err) ->
      callback(err) if callback
      Promise.reject(err)

  build: (args) ->
    model = new @modelClass(@connection, @namespaceId)
    model[key] = val for key, val of args
    model

  path: ->
    if @namespaceId
      "/n/#{@namespaceId}/#{@modelClass.collectionName}"
    else
      "/#{@modelClass.collectionName}"

  # Internal

  getModel: (id) ->
    @connection.request
      method: 'GET'
      path: "#{@path()}/#{id}"
    .then (json) =>
      model = new @modelClass(@connection, @namespaceId, json)
      Promise.resolve(model)

  getModelCollection: (params, offset, limit) ->
    @connection.request
      method: 'GET'
      path: @path()
      qs: _.extend {}, params, {offset, limit}
    .then (jsonArray) =>
      models = jsonArray.map (json) =>
        new @modelClass(@connection, @namespaceId, json)
      Promise.resolve(models)

  
