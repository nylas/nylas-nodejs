import NylasConnection from '../nylas-connection';
import DeltaStream, { DeltaLongPoll } from './delta-stream';
import { DeltaParams } from './delta';
import { Deltas } from './deltas';

export type LatestCursor = {
  cursor: string;
};

export default class DeltaCollection {
  connection: NylasConnection;
  private path = '/delta';

  constructor(connection: NylasConnection) {
    this.connection = connection;
  }

  latestCursor(
    callback: (error: Error | null, cursor: string | null) => void
  ): Promise<string> {
    const reqOpts = {
      method: 'POST',
      path: `${this.path}/latest_cursor`,
    };

    return this.connection
      .request(reqOpts)
      .then((response: LatestCursor) => {
        if (callback) {
          callback(null, response.cursor);
        }
        return Promise.resolve(response.cursor);
      })
      .catch(err => {
        if (callback) {
          callback(err, null);
        }
        return Promise.reject(err);
      });
  }

  since(cursor: string, params?: DeltaParams): Promise<Deltas> {
    const queryParams = this.buildDeltaParams(params);
    return this.connection
      .request({
        method: 'GET',
        path: `${this.path}`,
        qs: {
          cursor: cursor,
          ...queryParams,
        },
      })
      .then(response => {
        return Promise.resolve(new Deltas(this.connection).fromJSON(response));
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }

  async longPoll(
    cursor: string,
    timeout: number,
    params?: DeltaParams
  ): Promise<DeltaLongPoll> {
    const queryParams = this.buildDeltaParams(params);
    const stream = new DeltaLongPoll(
      this.connection,
      cursor,
      timeout,
      queryParams
    );
    await stream.open(true);
    return stream;
  }

  async startStream(
    cursor: string,
    params: Record<string, unknown> = {}
  ): Promise<DeltaStream> {
    const stream = new DeltaStream(this.connection, cursor, params);
    await stream.open();
    return stream;
  }

  private buildDeltaParams(params?: DeltaParams): Record<string, unknown> {
    const queryString: Record<string, unknown> = {};
    if (params) {
      if (params.view) {
        queryString.view = params.view;
      }
      if (params.excludeTypes) {
        queryString.exclude_types = params.excludeTypes.join();
      }
      if (params.includeTypes) {
        queryString.include_types = params.includeTypes.join();
      }
    }
    return queryString;
  }
}
