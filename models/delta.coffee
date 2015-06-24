{EventEmitter} = require 'events'
JSONStream = require 'JSONStream'
Promise = require 'bluebird'
querystring = require 'querystring'
request = require 'request'

STREAMING_TIMEOUT_MS = 2000

module.exports = class Delta
  constructor: (@connection, @namespaceId) ->
    throw new Error("Connection object not provided") unless @connection instanceof require '../nylas-connection'
    @

  generateCursor: (timestampMs, callback = null) ->
    reqOpts =
      method: 'POST'
      path: "/n/#{@namespaceId}/delta/generate_cursor"
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

  startStream: (cursor, excludeTypes = []) ->
    stream = new DeltaStream(@connection, @namespaceId, cursor, excludeTypes)
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
  # @param {string} cursor Nylas delta API cursor
  # @param {Array<string>} excludeTypes object types to not return deltas for
  constructor: (@connection, @namespaceId, @cursor, @excludeTypes = []) ->
    throw new Error("Connection object not provided") unless @connection instanceof require '../nylas-connection'
    return @

  close: () ->
    @request.abort() if @request
    delete @request

  open: () ->
    path = "/n/#{@namespaceId}/delta/streaming"
    queryObj =
      cursor: @cursor
    queryObj.exclude_types = @excludeTypes.join(',') if @excludeTypes
    queryStr = querystring.stringify(queryObj)
    path += '?' + queryStr

    reqOpts = @connection.requestOptions
      method: 'GET'
      path: path
    @request = request(reqOpts)
      .on 'response', (response) =>
        @emit('response', response)  # Successfully established connection
        timeoutId = undefined
        response
          .on 'data', (data) =>
            # Nylas sends a newline heartbeat in the raw data stream once per second.
            # Automatically restart the connection if we haven't gotten any data in
            # STREAMING_TIMEOUT_MS. The connection will restart with the last
            # received cursor.
            clearTimeout(timeoutId)
            # TODO(ericyhwang): Handle errors on reconnection and exponentially back off.
            timeoutId = setTimeout @_restartConnection.bind(@), STREAMING_TIMEOUT_MS
          # Each data block received may not be a complete JSON object. Pipe through
          # JSONStream.parse(), which handles converting data blocks to JSON objects.
          .pipe(JSONStream.parse()).on 'data', (obj) =>
            @cursor = obj.cursor if obj.cursor
            @emit('delta', obj)
      .on 'error', (err) ->
        @emit('error', err)

  _restartConnection: () ->
    console.log 'Restarting Nylas DeltaStream connection', @
    @close()
    @open()
