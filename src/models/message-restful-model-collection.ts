import RestfulModelCollection from './restful-model-collection';
import Message from './message';
import NylasConnection from '../nylas-connection';
import { RestfulQuery } from './model-collection';

export interface BaseMessageQuery extends RestfulQuery {
  subject?: string;
  to?: string;
  from?: string;
  cc?: string;
  bcc?: string;
  filename?: string;
  in?: 'name' | 'display_name' | 'in';
  notIn?: 'name' | 'display_name' | 'in';
  anyEmail?: string[];
  unread?: boolean;
  starred?: boolean;
}

export interface MessageQuery extends BaseMessageQuery {
  threadId?: string;
  hasAttachment?: boolean;
  receivedBefore?: Date | number;
  receivedAfter?: Date | number;
}

export default class MessageRestfulModelCollection extends RestfulModelCollection<
  Message
> {
  constructor(connection: NylasConnection) {
    super(Message, connection);
  }

  /**
   * Return Multiple Messages by a list of Message IDs.
   * @param messageIds The list of message ids to find.
   * @param options Additional options including: view, offset, limit, and callback
   * @returns The list of messages.
   */
  findMultiple(
    messageIds: string[],
    options?: {
      view?: string;
      offset?: number;
      limit?: number;
      callback?: (error: Error | null, results?: Message[]) => void;
    }
  ): Promise<Message[]> {
    if (options && options.view) {
      // view is a parameter, so move it into a params object
      (options as Record<string, unknown>).params = {
        view: options.view,
      };
      delete options.view;
    }

    // If only one message ID was passed in, use the normal find function
    if (messageIds.length == 1) {
      return this.find(messageIds[0], options).then((message: Message) => {
        return [message];
      });
    }

    return this.range({
      path: `${this.path()}/${messageIds.join()}`,
      ...options,
    });
  }

  /**
   * Return raw message contents
   * @param messageId The message to fetch content of
   * @returns The raw message contents
   */
  findRaw(messageId: string): Promise<string> {
    return this.connection
      .request({
        method: 'GET',
        headers: {
          Accept: 'message/rfc822',
        },
        path: `${this.path()}/${messageId}`,
      })
      .catch(err => Promise.reject(err));
  }

  list(
    params: MessageQuery = {},
    callback?: (error: Error | null, obj?: Message[]) => void
  ): Promise<Message[]> {
    return super.list(this.formatQuery(params), callback);
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

  static formatBaseMessageQuery(
    query: BaseMessageQuery
  ): Record<string, unknown> {
    return {
      subject: query.subject,
      to: query.to,
      from: query.from,
      cc: query.cc,
      bcc: query.bcc,
      filename: query.filename,
      in: query.in,
      not_in: query.notIn,
      any_email: query.anyEmail,
      unread: query.unread,
      starred: query.starred,
    };
  }
}
