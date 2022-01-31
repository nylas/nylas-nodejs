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
import Delta, { DeltaParams } from './delta';
import { Deltas } from './deltas';

export default class DeltaStream extends EventEmitter {
  // Max number of times to retry a connection if we receive no data heartbeats
  // from the Nylas server.
  static MAX_RESTART_RETRIES = 5;
  connection: NylasConnection;
  path: string;
  modelClass: typeof Deltas | typeof Delta;
  cursor?: string;
  params: DeltaParams;
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
    params: Record<string, unknown> = {}
  ) {
    super();
    this.connection = connection;
    this.cursor = cursor;
    this.params = params;
    this.path = '/delta/streaming';
    this.modelClass = Delta;
    if (!(this.connection instanceof NylasConnection)) {
      throw new Error('Connection object not provided');
    }
    this.restartBackoff.failAfter(DeltaStream.MAX_RESTART_RETRIES);
    this.restartBackoff
      .on('backoff', this.restartConnection.bind(this))
      .on('fail', () => {
        return this.emit(
          'error',
          `Nylas DeltaStream failed to reconnect after
          ${DeltaStream.MAX_RESTART_RETRIES}
          retries.`
        );
      });
  }

  close(): void {
    clearTimeout(this.timeoutId);
    delete this.timeoutId;
    this.restartBackoff.reset();
    if (this.requestInfo) {
      this.requestInfo.controller.abort();
    }
    delete this.requestInfo;
  }

  async open(emitAsModel?: boolean): Promise<void> {
    this.close();
    const { excludeTypes = [], includeTypes = [], ...params } = this.params;

    const queryObj: Record<string, unknown> = {
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
      path: this.path,
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
          return this.onError(err);
        });
        return;
      }
      // Successfully established connection
      this.emit('response', response);
      this.onDataReceived();
      return (
        response.body
          .on('data', this.onDataReceived.bind(this))
          // Each data block received may not be a complete JSON object. Pipe through
          // JSONStream.parse(), which handles converting data blocks to JSON objects.
          .pipe(JSONStream.parse())
          .on('data', (obj: any) => {
            if (emitAsModel === true) {
              obj = new this.modelClass(this.connection).fromJSON(obj);
            }
            if (obj.cursor) {
              this.cursor = obj.cursor;
            }
            return this.emit('delta', obj);
          })
      );
    } catch (error) {
      this.onError(error);
    }
  }

  protected onDataReceived(): void {
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

  private onError(err: Error): void {
    this.emit('error', err);
    return this.restartBackoff.reset();
  }

  private restartConnection(n: number): Promise<void> {
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

export class DeltaLongPoll extends DeltaStream {
  constructor(
    connection: NylasConnection,
    cursor: string,
    timeout: number,
    params: Record<string, unknown> = {}
  ) {
    super(connection, cursor, params);
    params['timeout'] = timeout;
    this.params = params;
    this.path = '/delta/longpoll';
    this.modelClass = Deltas;
  }

  protected onDataReceived(): void {
    // For streaming we restart the connection on every data received in order
    // to keep the connection alive. For long polling this is not needed as the
    // server terminates the connection when data is sent
    return;
  }
}
