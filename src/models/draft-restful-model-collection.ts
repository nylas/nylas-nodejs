import RestfulModelCollection from './restful-model-collection';
import Draft, { DraftProperties, SendOptions } from './draft';
import NylasConnection from '../nylas-connection';
import Message from './message';
import MessageRestfulModelCollection, {
  MessageQuery,
} from './message-restful-model-collection';

export default class DraftRestfulModelCollection extends RestfulModelCollection<
  Draft
> {
  constructor(connection: NylasConnection) {
    super(Draft, connection);
  }

  create(
    props: DraftProperties,
    callback?: (error: Error | null, result?: Draft) => void
  ): Promise<Draft> {
    return new Draft(this.connection, props).save(callback);
  }

  send(props: DraftProperties, callback?: SendOptions): Promise<Message> {
    return new Draft(this.connection, props).send(callback);
  }

  list(
    params: MessageQuery,
    callback?: (error: Error | null, obj?: Draft[]) => void
  ): Promise<Draft[]> {
    return super.list(params, callback);
  }

  protected formatQuery(query: MessageQuery): Record<string, unknown> {
    const receivedBefore = RestfulModelCollection.formatTimestampQuery(
      query.receivedBefore
    );
    const receivedAfter = RestfulModelCollection.formatTimestampQuery(
      query.receivedAfter
    );

    return {
      ...super.formatQuery(query),
      ...MessageRestfulModelCollection.formatBaseMessageQuery(query),
      thread_id: query.threadId,
      has_attachment: query.hasAttachment,
      received_before: receivedBefore,
      received_after: receivedAfter,
    };
  }
}
