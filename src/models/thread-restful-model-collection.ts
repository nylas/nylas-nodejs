import RestfulModelCollection from './restful-model-collection';
import Thread from './thread';
import NylasConnection from '../nylas-connection';
import MessageRestfulModelCollection, {
  BaseMessageQuery,
  MessageQuery,
} from './message-restful-model-collection';

export interface ThreadQuery extends BaseMessageQuery {
  lastMessageBefore?: Date | number;
  lastMessageAfter?: Date | number;
  startedBefore?: Date | number;
  startedAfter?: Date | number;
  lastUpdatedBefore?: Date | number;
  lastUpdatedAfter?: Date | number;
  lastUpdatedTimestamp?: Date | number;
}

export default class ThreadRestfulModelCollection extends RestfulModelCollection<
  Thread
> {
  constructor(connection: NylasConnection) {
    super(Thread, connection);
  }

  list(
    params: MessageQuery = {},
    callback?: (error: Error | null, obj?: any[]) => void
  ): Promise<Thread[]> {
    return super.list(params, callback);
  }

  protected formatQuery(query: ThreadQuery): Record<string, unknown> {
    const lastMessageBefore = RestfulModelCollection.formatTimestampQuery(
      query.lastMessageBefore
    );
    const lastMessageAfter = RestfulModelCollection.formatTimestampQuery(
      query.lastMessageAfter
    );
    const startedBefore = RestfulModelCollection.formatTimestampQuery(
      query.startedBefore
    );
    const startedAfter = RestfulModelCollection.formatTimestampQuery(
      query.startedAfter
    );
    const lastUpdatedBefore = RestfulModelCollection.formatTimestampQuery(
      query.lastUpdatedBefore
    );
    const lastUpdatedAfter = RestfulModelCollection.formatTimestampQuery(
      query.lastUpdatedAfter
    );
    const lastUpdatedTimestamp = RestfulModelCollection.formatTimestampQuery(
      query.lastUpdatedTimestamp
    );

    return {
      ...super.formatQuery(query),
      ...MessageRestfulModelCollection.formatBaseMessageQuery(query),
      last_message_before: lastMessageBefore,
      last_message_after: lastMessageAfter,
      started_before: startedBefore,
      started_after: startedAfter,
      last_updated_before: lastUpdatedBefore,
      last_updated_after: lastUpdatedAfter,
      last_updated_timestamp: lastUpdatedTimestamp,
    };
  }
}
