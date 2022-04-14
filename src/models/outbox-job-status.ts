import OutboxMessage, { OutboxMessageProperties } from './outbox-message';
import Attributes, { Attribute } from './attributes';
import NylasConnection from '../nylas-connection';
import JobStatus, { JobStatusProperties } from './job-status';

export type OutboxJobStatusProperties = JobStatusProperties & {
  messageId?: string;
  threadId?: string;
  sendAt?: Date;
  originalSendAt?: Date;
  originalData?: OutboxMessageProperties;
};

export default class OutboxJobStatus extends JobStatus
  implements OutboxJobStatusProperties {
  messageId?: string;
  threadId?: string;
  sendAt?: Date;
  originalSendAt?: Date;
  originalData?: OutboxMessage;
  static attributes: Record<string, Attribute> = {
    ...JobStatus.attributes,
    messageId: Attributes.String({
      modelKey: 'messageId',
      jsonKey: 'message_id',
      readOnly: true,
    }),
    threadId: Attributes.String({
      modelKey: 'threadId',
      jsonKey: 'thread_id',
      readOnly: true,
    }),
    sendAt: Attributes.DateTime({
      modelKey: 'sendAt',
      jsonKey: 'send_at',
      readOnly: true,
    }),
    originalSendAt: Attributes.DateTime({
      modelKey: 'originalSendAt',
      jsonKey: 'original_send_at',
      readOnly: true,
    }),
    originalData: Attributes.Object({
      modelKey: 'originalData',
      jsonKey: 'original_data',
      itemClass: OutboxMessage,
      readOnly: true,
    }),
  };

  constructor(connection: NylasConnection, props?: OutboxJobStatusProperties) {
    super(connection, props);
    this.initAttributes(props);
  }
}
