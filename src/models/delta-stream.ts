/*
A connection to the Nylas delta streaming API.

Emits the following events:
- `response` when the connection is established, with one argument, a `http.IncomingMessage`
- `delta` for each delta received
- `error` when an error occurs in the connection
- `info` when the connection status changes
*/
import { EventEmitter } from 'events';
import NylasConnection from '../nylas-connection';
import fetch, { Request } from 'node-fetch';
import AbortController from 'abort-controller';
import backoff from 'backoff';
import JSONStream from 'JSONStream';
import Delta from './delta';

export default class DeltaStream extends EventEmitter {
  // Max number of times to retry a connection if we receive no data heartbeats
  // from the Nylas server.
  static MAX_RESTART_RETRIES = 5;
  connection: NylasConnection;
  cursor?: string;
  params: {
    includeTypes?: string[];
    excludeTypes?: string[];
    expanded?: boolean;
  };
  requestInfo?: {
    request: Request;
    controller: AbortController;
  };
  restartBackoff = backoff.exponential({
    randomisationFactor: 0.5,
    initialDelay: 250,
    maxDelay: 30000,
    factor: 4,
  });
  timeoutId?: number;

  // @param {string} cursor Nylas delta API cursor
  // @param {Object} params object contianing query string params to be passed to  the request
  // @param {Array<string>} params.excludeTypes object types to not return deltas for (e.g., {excludeTypes: ['thread']})
  // @param {Array<string>} params.includeTypes object types to exclusively return deltas for (e.g., {includeTypes: ['thread']})
  // @param {boolean} params.expanded boolean to specify wether to request the expanded view
  constructor(
    connection: NylasConnection,
    cursor: string,
    params: { [key: string]: any } = {}
  ) {
    super();
    this.connection = connection;
    this.cursor = cursor;
    this.params = params;
    if (!(this.connection instanceof NylasConnection)) {
      throw new Error('Connection object not provided');
    }
    this.restartBackoff.failAfter(DeltaStream.MAX_RESTART_RETRIES);
    this.restartBackoff
      .on('backoff', this._restartConnection.bind(this))
      .on('fail', () => {
        return this.emit(
          'error',
          `Nylas DeltaStream failed to reconnect after
          ${DeltaStream.MAX_RESTART_RETRIES}
          retries.`
        );
      });
  }

  close() {
    clearTimeout(this.timeoutId);
    delete this.timeoutId;
    this.restartBackoff.reset();
    if (this.requestInfo) {
      this.requestInfo.controller.abort();
    }
    delete this.requestInfo;
  }

  async open() {
    this.close();
    const path = '/delta/streaming';
    const { excludeTypes = [], includeTypes = [], ...params } = this.params;

    const queryObj: { [key: string]: any } = {
      ...params,
      cursor: this.cursor,
    };
    if (excludeTypes.length > 0) {
      queryObj.exclude_types = excludeTypes.join(',');
    }
    if (includeTypes.length > 0) {
      queryObj.include_types = includeTypes.join(',');
    }

    const request = this.connection.newRequest({
      method: 'GET',
      path,
      qs: queryObj,
    });
    try {
      const controller = new AbortController();
      this.requestInfo = {
        request,
        controller,
      };
      const response = await fetch(request, { signal: controller.signal });
      if (response.status !== 200) {
        response.body.on('data', (data: any) => {
          let err = data;
          try {
            err = JSON.parse(err);
          } catch (e) {
            // Do nothing
          }
          // Do nothing, keep err as string.
          return this._onError(err);
        });
        return;
      }
      // Successfully established connection
      this.emit('response', response);
      this._onDataReceived();
      return (
        response.body
          .on('data', this._onDataReceived.bind(this))
          // Each data block received may not be a complete JSON object. Pipe through
          // JSONStream.parse(), which handles converting data blocks to JSON objects.
          .pipe(JSONStream.parse())
          .on('data', (obj: any) => {
            if (obj.cursor) {
              this.cursor = obj.cursor;
            }
            return this.emit('delta', obj);
          })
      );
    } catch (error) {
      this._onError(error);
    }
  }

  _onDataReceived() {
    // Nylas sends a newline heartbeat in the raw data stream once every 5 seconds.
    // Automatically restart the connection if we haven't gotten any data in
    // Delta.streamingTimeoutMs. The connection will restart with the last
    // received cursor.
    clearTimeout(this.timeoutId);
    this.restartBackoff.reset();
    this.timeoutId = setTimeout(
      this.restartBackoff.backoff.bind(this.restartBackoff),
      Delta.streamingTimeoutMs
    ) as any;
  }

  _onError(err: Error) {
    this.emit('error', err);
    return this.restartBackoff.reset();
  }

  _restartConnection(n: number) {
    this.emit(
      'info',
      `Restarting Nylas DeltaStream connection (attempt ${n + 1}): ${
        this.requestInfo != null ? this.requestInfo.request.url : undefined
      }`
    );
    this.close();
    return this.open();
  }
}
