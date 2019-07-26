import omit from 'lodash/omit';
import backoff from 'backoff';
import JSONStream from 'JSONStream';
import request from 'request';
import { EventEmitter } from 'events';

export default class Delta {
  constructor(connection) {
    this.connection = connection;
    if (!(this.connection instanceof require('../nylas-connection'))) {
      throw new Error('Connection object not provided');
    }
  }

  latestCursor(callback) {
    const reqOpts = {
      method: 'POST',
      path: '/delta/latest_cursor',
    };

    return this.connection
      .request(reqOpts)
      .then(response => {
        const { cursor } = response;
        if (callback) {
          callback(null, cursor);
        }
        return Promise.resolve(cursor);
      })
      .catch(err => {
        if (callback) {
          callback(err, null);
        }
        return Promise.reject(err);
      });
  }

  startStream(cursor, params = {}) {
    return this._startStream(request, cursor, params);
  }

  _startStream(createRequest, cursor, params) {
    const stream = new DeltaStream(
      createRequest,
      this.connection,
      cursor,
      params
    );
    stream.open();
    return stream;
  }
}
Delta.streamingTimeoutMs = 15000;

/*
A connection to the Nylas delta streaming API.

Emits the following events:
- `response` when the connection is established, with one argument, a `http.IncomingMessage`
- `delta` for each delta received
- `error` when an error occurs in the connection
- `info` when the connection status changes
*/
class DeltaStream extends EventEmitter {
  // @param {function} createRequest function to create a request; only present for testability
  // @param {string} cursor Nylas delta API cursor
  // @param {Object} params object contianing query string params to be passed to  the request
  // @param {Array<string>} params.excludeTypes object types to not return deltas for (e.g., {excludeTypes: ['thread']})
  // @param {Array<string>} params.includeTypes object types to exclusively return deltas for (e.g., {includeTypes: ['thread']})
  // @param {boolean} params.expanded boolean to specify wether to request the expanded view
  constructor(createRequest, connection, cursor, params = {}) {
    super(createRequest, connection, cursor, params);
    this.createRequest = createRequest;
    this.connection = connection;
    this.cursor = cursor;
    this.params = params;
    if (!(this.connection instanceof require('../nylas-connection'))) {
      throw new Error('Connection object not provided');
    }
    this.restartBackoff = backoff.exponential({
      randomisationFactor: 0.5,
      initialDelay: 250,
      maxDelay: 30000,
      factor: 4,
    });
    this.restartBackoff.failAfter(DeltaStream.MAX_RESTART_RETRIES);
    this.restartBackoff
      .on('backoff', this._restartConnection.bind(this))
      .on('fail', () => {
        return this.emit(
          'error',
          `Nylas DeltaStream failed to reconnect after ${DeltaStream.MAX_RESTART_RETRIES} retries.`
        );
      });
  }

  close() {
    clearTimeout(this.timeoutId);
    delete this.timeoutId;
    this.restartBackoff.reset();
    if (this.request) {
      this.request.abort();
    }
    delete this.request;
  }

  open() {
    this.close();
    const path = '/delta/streaming';
    const excludeTypes =
      this.params.excludeTypes != null ? this.params.excludeTypes : [];
    const includeTypes =
      this.params.includeTypes != null ? this.params.includeTypes : [];

    const queryObj = {
      ...omit(this.params, ['excludeTypes', 'includeTypes']),
      cursor: this.cursor,
    };
    if (excludeTypes.length > 0) {
      queryObj.exclude_types = excludeTypes.join(',');
    }
    if (includeTypes.length > 0) {
      queryObj.include_types = includeTypes.join(',');
    }

    const reqOpts = this.connection.requestOptions({
      method: 'GET',
      path,
      qs: queryObj,
    });

    return (this.request = this.createRequest(reqOpts)
      .on('response', response => {
        if (response.statusCode !== 200) {
          response.on('data', data => {
            let err = data;
            try {
              err = JSON.parse(err);
            } catch (e) {}
            // Do nothing, keep err as string.
            return this._onError(err);
          });
          return;
        }
        // Successfully established connection
        this.emit('response', response);
        this._onDataReceived();
        return (
          response
            .on('data', this._onDataReceived.bind(this))
            // Each data block received may not be a complete JSON object. Pipe through
            // JSONStream.parse(), which handles converting data blocks to JSON objects.
            .pipe(JSONStream.parse())
            .on('data', obj => {
              if (obj.cursor) {
                this.cursor = obj.cursor;
              }
              return this.emit('delta', obj);
            })
        );
      })
      .on('error', this._onError.bind(this)));
  }

  _onDataReceived(data) {
    // Nylas sends a newline heartbeat in the raw data stream once every 5 seconds.
    // Automatically restart the connection if we haven't gotten any data in
    // Delta.streamingTimeoutMs. The connection will restart with the last
    // received cursor.
    clearTimeout(this.timeoutId);
    this.restartBackoff.reset();
    return (this.timeoutId = setTimeout(
      this.restartBackoff.backoff.bind(this.restartBackoff),
      Delta.streamingTimeoutMs
    ));
  }

  _onError(err) {
    this.emit('error', err);
    return this.restartBackoff.reset();
  }

  _restartConnection(n) {
    this.emit(
      'info',
      `Restarting Nylas DeltaStream connection (attempt ${n + 1}): ${
        this.request != null ? this.request.href : undefined
      }`
    );
    this.close();
    return this.open();
  }
}
// Max number of times to retry a connection if we receive no data heartbeats
// from the Nylas server.
DeltaStream.MAX_RESTART_RETRIES = 5;
