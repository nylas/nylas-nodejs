{EventEmitter} = require 'events'
jasmine = require 'jasmine-node'
{PassThrough} = require 'stream'
Delta = require '../models/delta'
NylasConnection = require '../nylas-connection'

testUntil = (fn) ->
  finished = false
  runs ->
    fn (callback) ->
      finished = true
  waitsFor -> finished

describe 'Delta', ->
  beforeEach ->
    @connection = new NylasConnection('123')
    @delta = new Delta(@connection)
    jasmine.Clock.useMock()
    # Work around clearTimeout not being correctly mocked in Jasmine:
    # https://github.com/mhevery/jasmine-node/issues/276
    spyOn(global, 'clearTimeout').andCallFake () ->
      return jasmine.Clock.installed.clearTimeout.apply(@, arguments)

  describe 'startStream (delta streaming)', ->
    createRequest = (requestOpts) ->
      request = new EventEmitter()
      request.origOpts = requestOpts
      request.abort = jasmine.createSpy('abort')
      return request

    createResponse = (statusCode) ->
      response = new PassThrough()
      response.statusCode = statusCode
      return response

    # Listens to the 'delta' event on the stream and pushes them to the returned array.
    observeDeltas = (stream) ->
      deltas = []
      stream.on 'delta', (delta) ->
        deltas.push(delta)
      return deltas

    it 'start and close stream', ->
      stream = @delta._startStream(createRequest, 'deltacursor0')
      request = stream.request

      expect(request.origOpts.method).toBe('GET')
      expect(request.origOpts.path).toBe('/delta/streaming?cursor=deltacursor0')

      response = createResponse(200)
      request.emit('response', response)

      expect(request.abort.calls.length).toEqual(0)
      stream.close()
      expect(request.abort.calls.length).toEqual(1)
      expect(stream.request).toEqual(undefined)

      # Make sure the stream doesn't auto-restart if explicitly closed.
      jasmine.Clock.tick(5500)
      expect(stream.request).toEqual(undefined)

    it 'stream response parsing', ->
      stream = @delta._startStream(createRequest, 'deltacursor0')
      request = stream.request
      deltas = observeDeltas(stream)

      response = createResponse(200)
      request.emit('response', response)
      expect(deltas).toEqual([])
      expect(stream.cursor).toEqual('deltacursor0')

      delta1 =
        cursor: 'deltacursor1'
        attributes: {}
        object: 'thread'
        event: 'create'
        id: 'deltaid1'

      response.write(JSON.stringify(delta1))
      expect(deltas).toEqual([delta1])
      expect(stream.cursor).toEqual('deltacursor1')

      stream.close()

    it 'stream response parsing, delta split across data packets', ->
      stream = @delta._startStream(createRequest, 'deltacursor0')
      request = stream.request
      deltas = observeDeltas(stream)

      response = createResponse(200)
      request.emit('response', response)
      expect(deltas).toEqual([])
      expect(stream.cursor).toEqual('deltacursor0')

      delta1 =
        cursor: 'deltacursor1'
        attributes: {}
        object: 'thread'
        event: 'create'
        id: 'deltaid1'
      deltaStr = JSON.stringify(delta1)

      # Partial data packet will not result in a delta yet...
      response.write(deltaStr.substring(0, 20))
      expect(deltas).toEqual([])
      expect(stream.cursor).toEqual('deltacursor0')

      # ...now the rest of the delta comes in, and there should be a delta object.
      response.write(deltaStr.substring(20))
      expect(deltas).toEqual([delta1])
      expect(stream.cursor).toEqual('deltacursor1')

      stream.close()

    it 'stream timeout and auto-restart', ->
      stream = @delta._startStream(createRequest, 'deltacursor0')
      request = stream.request

      response = createResponse(200)
      request.emit('response', response)
      expect(stream.cursor).toEqual('deltacursor0')

      expectRequestNotAborted = (request) ->
        expect(request.abort.calls.length).toEqual(0)

      # Server sends a heartbeat every second.
      response.write('\n')
      jasmine.Clock.tick(1000)
      expect(request.abort.calls.length).toEqual(0)
      response.write('\n')
      expect(request.abort.calls.length).toEqual(0)

      # Actual response packets also reset the timeout.
      jasmine.Clock.tick(1000)
      delta1 =
        cursor: 'deltacursor1'
      response.write(JSON.stringify(delta1))
      expect(stream.cursor).toEqual('deltacursor1')
      jasmine.Clock.tick(1500)
      expect(request.abort.calls.length).toEqual(0)

      # If the timeout has elapsed since the last data received, the stream is restarted.
      jasmine.Clock.tick(4000)
      # The old request should have been aborted, and a new request created.
      expect(request.abort.calls.length).toEqual(1)
      expect(stream.request).not.toBe(request)
      # The new request should be using the last delta cursor received prior to timeout.
      expect(stream.request.origOpts.path).toBe('/delta/streaming?cursor=deltacursor1')

      stream.close()

  describe 'latestCursor', ->
    it 'returns a cursor', ->
      spyOn(@connection, 'request').andCallFake -> Promise.resolve({cursor: "abcdefg"})

      @delta.latestCursor (err, cursor) ->
        expect(cursor).toEqual('abcdefg');

      expect(@connection.request).toHaveBeenCalledWith({
        method : 'POST',
        path : '/delta/latest_cursor'
      });

    it 'returns a null cursor in case of an error', ->
      spyOn(@connection, 'request').andCallFake -> Promise.reject("Error.")
      @delta.latestCursor (err, cursor) ->
        expect(err).toEqual("Error.");
        expect(cursor).toEqual(null);
