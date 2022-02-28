import Draft, { DraftProperties } from './draft';
import Attributes, { Attribute } from './attributes';
import NylasConnection from '../nylas-connection';

export type OutboxMessageProperties = DraftProperties & {
  sendAt: Date;
  retryLimitDatetime?: Date;
  originalSendAt?: Date;
};

export default class OutboxMessage extends Draft
  implements OutboxMessageProperties {
  sendAt = new Date();
  retryLimitDatetime?: Date;
  originalSendAt?: Date;
  static collectionName = '/v2/outbox';
  static attributes: Record<string, Attribute> = {
    ...Draft.attributes,
    sendAt: Attributes.DateTime({
      modelKey: 'sendAt',
      jsonKey: 'send_at',
    }),
    retryLimitDatetime: Attributes.DateTime({
      modelKey: 'retryLimitDatetime',
      jsonKey: 'retry_limit_datetime',
    }),
    originalSendAt: Attributes.DateTime({
      modelKey: 'originalSendAt',
      jsonKey: 'original_send_at',
      readOnly: true,
    }),
  };

  constructor(connection: NylasConnection, props?: OutboxMessageProperties) {
    super(connection, props);
    this.initAttributes(props);
  }
}
