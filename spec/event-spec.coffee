Nylas = require '../nylas'
NylasConnection = require '../nylas-connection'
Event = require '../models/event'
Promise = require 'bluebird'
request = require 'request'
_ = require 'underscore'

testUntil = (fn) ->
  finished = false
  runs ->
    fn (callback) ->
      finished = true
  waitsFor -> finished

describe "Event", ->
  beforeEach ->
    @connection = new NylasConnection('123')
    @event = new Event(@connection, 'test-namespace-id')
    Promise.onPossiblyUnhandledRejection (e, promise) ->

  describe "save", ->
    it "should do a POST request if the event has no id", ->
      @event.id = undefined
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @event.save()
      expect(@connection.request).toHaveBeenCalledWith({
        method : 'POST',
        body : {
          id : undefined,
          object : 'event',
          namespace_id : 'test-namespace-id',
          calendar_id : undefined,
          busy : undefined,
          title : undefined,
          description : undefined,
          location : undefined,
          when : undefined,
          _start : undefined,
          _end : undefined,
          participants : [  ]
        },
        path : '/n/test-namespace-id/events'
      })

    it "should do a PUT request if the event has an id", ->
      @event.id = 'id-1234'
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @event.save()

      expect(@connection.request).toHaveBeenCalledWith({
        method : 'PUT',
        body : {
          id : 'id-1234',
          object : 'event',
          namespace_id : 'test-namespace-id',
          calendar_id : undefined,
          busy : undefined,
          title : undefined,
          description : undefined,
          location : undefined,
          when : undefined,
          _start : undefined,
          _end : undefined,
          participants : [  ]
        },
        path : '/n/test-namespace-id/events/id-1234'
      })

    describe "when the request succeeds", ->
      beforeEach ->
        spyOn(@connection, 'request').andCallFake ->
          eventJSON = {
            id: 'id-1234'
            title: 'test event'
            when: { }
          }
          Promise.resolve(eventJSON)

      it "should resolve with the event object", ->
        testUntil (done) =>
          @event.save().then (event) ->
            expect(event.id).toBe('id-1234')
            expect(event.title).toBe('test event')
            done()

      it "should call the callback with the event object", ->
        testUntil (done) =>
          @event.save (err, event) ->
            expect(err).toBe(null)
            expect(event.id).toBe('id-1234')
            expect(event.title).toBe('test event')
            done()

    describe "when the request fails", ->
      beforeEach ->
        @error = new Error("Network error")
        spyOn(@connection, 'request').andCallFake =>
          Promise.reject(@error)

      it "should reject with the error", ->
        testUntil (done) =>
          @event.save().catch (err) =>
            expect(err).toBe(@error)
            done()

      it "should call the callback with the error", ->
        testUntil (done) =>
          @event.save (err, event) =>
            expect(err).toBe(@error)
            expect(event).toBe(undefined)
            done()
