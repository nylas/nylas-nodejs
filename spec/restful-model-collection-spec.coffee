Nylas = require '../nylas'
NylasConnection = require '../nylas-connection'
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
    Nylas.config
      appId: '123'
      appSecret: '123'
    @connection = new NylasConnection('test-access-token')
    @collection = new RestfulModelCollection(Thread, @connection)

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
            account_id: undefined,
            subject: 'A'
          })
        threadsResponses.push(response)

      spyOn(@collection, 'getModelCollection').andCallFake (params, offset, limit) ->
        Promise.resolve(threadsResponses[offset / 100])

    it "should fetch models with the given params", ->
      params = {from: 'ben@nylas.com'}
      threads = [{
        id: '123'
        account_id: undefined
        subject: 'A'
      }]
      @collection.forEach(params, (->), (->))
      expect(@collection.getModelCollection).toHaveBeenCalledWith(params, 0, 100)

    it "should fetch repeatedly until fewer than requested models are returned", ->
      params = {from: 'ben@nylas.com'}
      runs ->
        @collection.forEach(params, (->), (->))
      waitsFor ->
        @collection.getModelCollection.callCount == 4
      runs ->
        expect(@collection.getModelCollection.calls[0].args).toEqual([ { from : 'ben@nylas.com' }, 0, 100 ])
        expect(@collection.getModelCollection.calls[1].args).toEqual([ { from : 'ben@nylas.com' }, 100, 100 ])
        expect(@collection.getModelCollection.calls[2].args).toEqual([ { from : 'ben@nylas.com' }, 200, 100 ])
        expect(@collection.getModelCollection.calls[3].args).toEqual([ { from : 'ben@nylas.com' }, 300, 100 ])

    it "should call eachCallback with each model fetched", ->
      params = {from: 'ben@nylas.com'}
      eachCallCount = 0
      runs ->
        @collection.forEach(params, (-> eachCallCount += 1), (->))
      waitsFor ->
        @collection.getModelCollection.callCount == 4
      runs ->
        expect(eachCallCount).toBe(313)

    it "should call completeCallback when finished", ->
      params = {from: 'ben@nylas.com'}
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
      @collection.count({from: 'ben@nylas.com'})
      expect(@connection.request).toHaveBeenCalledWith({ method : 'GET', path : '/threads', qs : { view : 'count', from : 'ben@nylas.com' } })

    describe "when the request is successful", ->
      beforeEach ->
        spyOn(@connection, 'request').andCallFake ->
          Promise.resolve({count: 1023})

      it "should resolve with the count", ->
        testUntil (done) =>
          @collection.count({from: 'ben@nylas.com'}).then (count) ->
            expect(count).toBe(1023)
            done()

      it "should call the optional callback with the count", ->
        testUntil (done) =>
          @collection.count {from: 'ben@nylas.com'}, (callbackError, count) ->
            expect(count).toBe(1023)
            done()

    describe "when the request fails", ->
      beforeEach ->
        @error = new Error("Network error")
        spyOn(@connection, 'request').andCallFake =>
          Promise.reject(@error)

      it "should reject with any error", ->
        testUntil (done) =>
          @collection.count({from: 'ben@nylas.com'}).catch (rejectError) =>
            expect(rejectError).toBe(@error)
            done()

      it "should call the optional callback with any error", ->
        testUntil (done) =>
          @collection.count {from: 'ben@nylas.com'}, (callbackError, count) =>
            expect(callbackError).toBe(@error)
            done()

  describe "first", ->
    describe "when the request is successful", ->
      beforeEach ->
        @item = { id: '123' }
        @items = [@item]
        spyOn(@collection, 'getModelCollection').andCallFake =>
          Promise.resolve(@items)

      it "should fetch one item with the provided params", ->
        @collection.first({from: 'ben@nylas.com'})
        expect(@collection.getModelCollection).toHaveBeenCalledWith({from: 'ben@nylas.com'}, 0, 1)

      it "should resolve with the first item", ->
        testUntil (done) =>
          @collection.first({from: 'ben@nylas.com'}).then (item) =>
            expect(item).toBe(@item)
            done()

      it "should call the optional callback with the first item", ->
        testUntil (done) =>
          @collection.first {from: 'ben@nylas.com'}, (err, item) =>
            expect(item).toBe(@item)
            done()

      it "should not throw an exception when no items are returned", ->
        @items = []
        testUntil (done) =>
          @collection.first({from: 'ben@nylas.com'}).then (item) =>
            expect(item).toBe(undefined)
            done()

    describe "when the request fails", ->
      beforeEach ->
        @error = new Error("Network error")
        spyOn(@collection, 'getModelCollection').andCallFake =>
          Promise.reject(@error)

      it "should reject with any underlying error", ->
        testUntil (done) =>
          @collection.first({from: 'ben@nylas.com'}).catch (err) =>
            expect(err).toBe(@error)
            done()

      it "should call the optional callback with the underlying error", ->
        testUntil (done) =>
          @collection.first {from: 'ben@nylas.com'}, (err, item) =>
            expect(err).toBe(@error)
            done()

  describe "list", ->
    it "should call range() with an inifite range", ->
      spyOn(@collection, 'range')

      params = {from: 'ben@nylas.com'}
      callback = () ->
      @collection.list(params, callback)
      expect(@collection.range).toHaveBeenCalledWith(params, 0, Infinity, callback)

  describe "find", ->
    it "should reject with an error if an id is not provided", ->
      testUntil (done) =>
        @collection.find().catch(done)

    it "should make an API request for the individual model", ->
      spyOn(@connection, 'request').andCallFake => Promise.resolve({})
      testUntil (done) =>
        @collection.find('123')
        expect(@connection.request).toHaveBeenCalledWith({ method : 'GET', path : '/threads/123' })
        done()

    describe "when the request succeeds", ->
      beforeEach ->
        @item = { id: '123' }
        spyOn(@connection, 'request').andCallFake =>
          Promise.resolve(@item)

      it "should resolve with the item", ->
        testUntil (done) =>
          @collection.find('123').then (item) =>
            expect(item instanceof Thread).toBe(true)
            expect(item.id).toBe('123')
            done()

      it "should call the optional callback with the first item", ->
        testUntil (done) =>
          @collection.find '123', (err, item) =>
            expect(item instanceof Thread).toBe(true)
            expect(item.id).toBe('123')
            done()

    describe "when the request fails", ->
      beforeEach ->
        @error = new Error("Network error")
        spyOn(@connection, 'request').andCallFake =>
          Promise.reject(@error)

      it "should reject with any underlying error", ->
        testUntil (done) =>
          @collection.find('123').catch (err) =>
            expect(err).toBe(@error)
            done()

      it "should call the optional callback with the underlying error", ->
        testUntil (done) =>
          @collection.find '123', (err, item) =>
            expect(err).toBe(@error)
            done()

  describe "range", ->
    beforeEach ->
      threadsResponses = []
      for x in [0..3]
        response = []
        count = if x < 3 then 99 else 12
        for i in [0..count]
          response.push({
            id: '123',
            account_id: undefined,
            subject: 'A'
          })
        threadsResponses.push(response)

      spyOn(@collection, 'getModelCollection').andCallFake (params, offset, limit) ->
        Promise.resolve(threadsResponses[offset / 100])

    it "should fetch once if fewer than one page of models are requested", ->
      params = {from: 'ben@nylas.com'}
      threads = [{
        id: '123'
        account_id: undefined
        subject: 'A'
      }]
      @collection.range(params, 0, 50)
      expect(@collection.getModelCollection).toHaveBeenCalledWith(params, 0, 50)

    it "should fetch repeatedly until the requested number of models have been returned", ->
      params = {from: 'ben@nylas.com'}
      threads = [{
        id: '123'
        account_id: undefined
        subject: 'A'
      }]
      runs ->
        @collection.range(params, 0, 300)
      waitsFor ->
        @collection.getModelCollection.callCount == 3
      runs ->
        expect(@collection.getModelCollection.calls[0].args).toEqual([ { from : 'ben@nylas.com' }, 0, 100 ])
        expect(@collection.getModelCollection.calls[1].args).toEqual([ { from : 'ben@nylas.com' }, 100, 100 ])
        expect(@collection.getModelCollection.calls[2].args).toEqual([ { from : 'ben@nylas.com' }, 200, 100 ])

    it "should stop fetching if fewer than requested models are returned", ->
      params = {from: 'ben@nylas.com'}
      runs ->
        @collection.range(params, 0, 10000)
      waitsFor ->
        @collection.getModelCollection.callCount == 4
      runs ->
        expect(@collection.getModelCollection.calls[0].args).toEqual([ { from : 'ben@nylas.com' }, 0, 100 ])
        expect(@collection.getModelCollection.calls[1].args).toEqual([ { from : 'ben@nylas.com' }, 100, 100 ])
        expect(@collection.getModelCollection.calls[2].args).toEqual([ { from : 'ben@nylas.com' }, 200, 100 ])
        expect(@collection.getModelCollection.calls[3].args).toEqual([ { from : 'ben@nylas.com' }, 300, 100 ])

    it "should call the callback with all of the loaded models", ->
      params = {from: 'ben@nylas.com'}
      testUntil (done) =>
        @collection.range params, 0, 10000, (err, models) ->
          expect(models.length).toBe(313)
          done()

    it "should resolve with the loaded models", ->
      params = {from: 'ben@nylas.com'}
      testUntil (done) =>
        @collection.range(params, 0, 10000).then (models) ->
          expect(models.length).toBe(313)
          done()

  describe "delete", ->
    beforeEach ->
      @item = new Thread(@connection, id: '123')

    it "should accept a model object as the first parameter", ->
      spyOn(@connection, 'request').andCallFake ->
        Promise.resolve()
      @collection.delete(@item)
      expect(@connection.request).toHaveBeenCalledWith({ method: 'DELETE', qs: { }, path: '/threads/123' })

    it "should accept a model id as the first parameter", ->
      spyOn(@connection, 'request').andCallFake ->
        Promise.resolve()
      @collection.delete(@item.id)
      expect(@connection.request).toHaveBeenCalledWith({ method: 'DELETE', qs: { }, path: '/threads/123' })

    it "should include params in the request if they were passed in", ->
      spyOn(@connection, 'request').andCallFake ->
        Promise.resolve()
      @collection.delete(@item.id, { foo: 'bar' })
      expect(@connection.request).toHaveBeenCalledWith({ method: 'DELETE', qs: { foo: 'bar' }, path: '/threads/123' })

    describe "when the api request is successful", ->
      beforeEach ->
        spyOn(@connection, 'request').andCallFake ->
          Promise.resolve()

      it "should resolve", ->
        testUntil (done) =>
          @collection.delete(@item.id).then ->
            done()

      it "should call it's callback with no error", ->
        testUntil (done) =>
          @collection.delete @item.id, (err) =>
            expect(err).toBe(null)
            done()

    describe "when the api request fails", ->
      beforeEach ->
        @error = new Error("Network error")
        spyOn(@connection, 'request').andCallFake =>
          Promise.reject(@error)

      it "should reject", ->
        testUntil (done) =>
          @collection.delete(@item.id).catch (err) =>
            expect(err).toBe(@error)
            done()

      it "should call it's callback with the error", ->
        testUntil (done) =>
          @collection.delete @item.id, (err) =>
            expect(err).toBe(@error)
            done()

  describe "build", ->
    it "should return a new instance of the model class", ->
      expect(@collection.build() instanceof Thread).toBe(true)

    it "should initialize the new instance with the connection", ->
      expect(@collection.build().connection).toBe(@connection)

    it "should set other attributes provided to the build method", ->
      expect(@collection.build(subject: '123').subject).toEqual('123')

  describe "path", ->
    it "should return the modelClass' collectionName with no prefix", ->
      expect(@collection.path()).toEqual('/threads')
