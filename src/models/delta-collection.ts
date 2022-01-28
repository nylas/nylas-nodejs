import NylasConnection from '../nylas-connection';
import DeltaStream from './delta-stream';
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

  async startStream(
    cursor: string,
    params: Record<string, unknown> = {}
  ): Promise<DeltaStream> {
    const stream = new DeltaStream(this.connection, cursor, params);
    await stream.open();
    return stream;
  }
}
