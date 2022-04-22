import RestfulModelCollection from './restful-model-collection';
import Message from './message';
import NylasConnection from '../nylas-connection';

export default class MessageRestfulModelCollection extends RestfulModelCollection<
  Message
> {
  connection: NylasConnection;
  modelClass: typeof Message;

  constructor(connection: NylasConnection) {
    super(Message, connection);
    this.connection = connection;
    this.modelClass = Message;
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
}
