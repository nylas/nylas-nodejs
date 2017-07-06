_ = require 'underscore'
backoff = require 'backoff'
{EventEmitter} = require 'events'
JSONStream = require 'JSONStream'
Promise = require 'bluebird'
request = require 'request'

module.exports = class Delta
  @streamingTimeoutMs = 15000

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

  startStream: (cursor, params = {}) ->
    return @_startStream(request, cursor, params)

  _startStream: (createRequest, cursor, params = {}) ->
    stream = new DeltaStream(createRequest, @connection, cursor, params)
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
  # @param {Object} params object contianing query string params to be passed to  the request
  # @param {Array<string>} params.excludeTypes object types to not return deltas for (e.g., {excludeTypes: ['thread']})
  # @param {Array<string>} params.includeTypes object types to exclusively return deltas for (e.g., {includeTypes: ['thread']})
  # @param {boolean} params.expanded boolean to specify wether to request the expanded view
  constructor: (@createRequest, @connection, @cursor, @params = {}) ->
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
    excludeTypes = @params.excludeTypes ? []
    includeTypes = @params.includeTypes ? []

    queryObj = _.extend({}, _.omit(@params, 'excludeTypes', 'includeTypes'), {
      cursor: @cursor
    })
    queryObj.exclude_types = excludeTypes.join(',') if excludeTypes.length > 0
    queryObj.include_types = includeTypes.join(',') if includeTypes.length > 0

    reqOpts = @connection.requestOptions
      method: 'GET'
      path: path
      qs: queryObj

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
    # Nylas sends a newline heartbeat in the raw data stream once every 5 seconds.
    # Automatically restart the connection if we haven't gotten any data in
    # Delta.streamingTimeoutMs. The connection will restart with the last
    # received cursor.
    clearTimeout(@timeoutId)
    @restartBackoff.reset()
    @timeoutId = setTimeout @restartBackoff.backoff.bind(@restartBackoff), Delta.streamingTimeoutMs

  _onError: (err) ->
    console.error 'Nylas DeltaStream error:', err
    @restartBackoff.reset()
    @emit('error', err)

  _restartConnection: (n) ->
    console.log "Restarting Nylas DeltaStream connection (attempt #{n + 1}):", @request?.href
    @close()
    @open()
