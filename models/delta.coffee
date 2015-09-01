backoff = require 'backoff'
{EventEmitter} = require 'events'
JSONStream = require 'JSONStream'
Promise = require 'bluebird'
querystring = require 'querystring'
request = require 'request'

STREAMING_TIMEOUT_MS = 5000

module.exports = class Delta
  constructor: (@connection) ->
    throw new Error("Connection object not provided") unless @connection instanceof require '../nylas-connection'
    @

  generateCursor: (timestampMs, callback = null) ->
    reqOpts =
      method: 'POST'
      path: "/delta/generate_cursor"
      # Nylas API takes a UNIX timestamp in seconds, not a C-like millisecond timestamp.
      body: {start: Math.floor(timestampMs / 1000)}

    @connection.request(reqOpts)
      .then (response) ->
        cursor = response.cursor
        callback(null, cursor) if callback
        Promise.resolve(cursor)
      .catch (err) ->
        callback(err) if callback
        Promise.reject(err)

  latestCursor: (callback) ->
    reqOpts =
      method: 'POST'
      path: "/delta/latest_cursor"

    @connection.request(reqOpts)
      .then (response) ->
        cursor = response.cursor
        callback(null, cursor) if callback
        Promise.resolve(cursor)
      .catch (err) ->
        callback(err) if callback
        Promise.reject(err)

  startStream: (cursor, excludeTypes = []) ->
    return @_startStream(request, cursor, excludeTypes)

  _startStream: (createRequest, cursor, excludeTypes = []) ->
    stream = new DeltaStream(createRequest, @connection, cursor, excludeTypes)
    stream.open()
    return stream

###
A connection to the Nylas delta streaming API.

Emits the following events:
- `response` when the connection is established, with one argument, a `http.IncomingMessage`
- `delta` for each delta received
- `error` when an error occurs in the connection
###
class DeltaStream extends EventEmitter
  # Max number of times to retry a connection if we receive no data heartbeats
  # from the Nylas server.
  @MAX_RESTART_RETRIES = 5

  # @param {function} createRequest function to create a request; only present for testability
  # @param {string} cursor Nylas delta API cursor
  # @param {Array<string>} excludeTypes object types to not return deltas for
  constructor: (@createRequest, @connection, @cursor, @excludeTypes = []) ->
    throw new Error("Connection object not provided") unless @connection instanceof require '../nylas-connection'
    @restartBackoff = backoff.exponential
      randomisationFactor: 0.5
      initialDelay: 250
      maxDelay: 30000
      factor: 4
    @restartBackoff.failAfter DeltaStream.MAX_RESTART_RETRIES
    @restartBackoff
      .on 'backoff', @_restartConnection.bind(@)
      .on 'fail', () =>
        @emit('error', "Nylas DeltaStream failed to reconnect after #{DeltaStream.MAX_RESTART_RETRIES} retries.")
    return @

  close: () ->
    clearTimeout(@timeoutId)
    delete @timeoutId
    @restartBackoff.reset()
    @request.abort() if @request
    delete @request

  open: () ->
    @close()
    path = "/delta/streaming"
    queryObj =
      cursor: @cursor
    queryObj.exclude_types = @excludeTypes.join(',') if @excludeTypes?.length > 0
    queryStr = querystring.stringify(queryObj)
    path += '?' + queryStr

    reqOpts = @connection.requestOptions
      method: 'GET'
      path: path
    @request = @createRequest(reqOpts)
      .on 'response', (response) =>
        unless response.statusCode == 200
          response.on 'data', (data) =>
            err = data
            try
              err = JSON.parse(err)
            catch e
              # Do nothing, keep err as string.
            @_onError(err)
          return
        # Successfully established connection
        @emit('response', response)
        @_onDataReceived()
        response
          .on 'data', @_onDataReceived.bind(@)
          # Each data block received may not be a complete JSON object. Pipe through
          # JSONStream.parse(), which handles converting data blocks to JSON objects.
          .pipe(JSONStream.parse()).on 'data', (obj) =>
            @cursor = obj.cursor if obj.cursor
            @emit('delta', obj)
      .on 'error', @_onError.bind(@)

  _onDataReceived: (data) ->
    # Nylas sends a newline heartbeat in the raw data stream once per second.
    # Automatically restart the connection if we haven't gotten any data in
    # STREAMING_TIMEOUT_MS. The connection will restart with the last
    # received cursor.
    clearTimeout(@timeoutId)
    @restartBackoff.reset()
    @timeoutId = setTimeout @restartBackoff.backoff.bind(@restartBackoff), STREAMING_TIMEOUT_MS

  _onError: (err) ->
    console.error 'Nylas DeltaStream error:', err
    @restartBackoff.reset()
    @emit('error', err)

  _restartConnection: (n) ->
    console.log "Restarting Nylas DeltaStream connection (attempt #{n + 1})", @
    @close()
    @open()
