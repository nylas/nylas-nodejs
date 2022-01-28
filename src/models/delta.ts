import NylasConnection from '../nylas-connection';
import DeltaStream from './delta-stream';

export type LatestCursor = {
  cursor: string;
};

export default class Delta {
  connection: NylasConnection;
  static streamingTimeoutMs = 15000;

  constructor(connection: NylasConnection) {
    this.connection = connection;
    if (!(this.connection instanceof NylasConnection)) {
      throw new Error('Connection object not provided');
    }
  }

  }
}
