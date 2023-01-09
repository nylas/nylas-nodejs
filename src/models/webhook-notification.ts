import Model from './model';
import Attributes, { Attribute } from './attributes';

export type LinkClickProperties = {
  id: number;
  ip: string;
  userAgent: string;
  timestamp: Date;
  linkIndex?: number;
};

export class LinkClick extends Model implements LinkClickProperties {
  id = 0;
  ip = '';
  userAgent = '';
  timestamp = new Date();
  linkIndex?: number;
  static attributes: Record<string, Attribute> = {
    id: Attributes.Number({
      modelKey: 'id',
    }),
    ip: Attributes.String({
      modelKey: 'ip',
    }),
    userAgent: Attributes.String({
      modelKey: 'userAgent',
      jsonKey: 'user_agent',
    }),
    timestamp: Attributes.DateTime({
      modelKey: 'timestamp',
    }),
    linkIndex: Attributes.Number({
      modelKey: 'linkIndex',
      jsonKey: 'link_index',
    }),
  };

  constructor(props?: LinkClickCountProperties) {
    super();
    this.initAttributes(props);
  }
}

export type LinkClickCountProperties = {
  url: string;
  count: number;
};

export class LinkClickCount extends Model implements LinkClickCountProperties {
  url = '';
  count = 0;
  static attributes: Record<string, Attribute> = {
    url: Attributes.String({
      modelKey: 'url',
    }),
    count: Attributes.Number({
      modelKey: 'count',
    }),
  };

  constructor(props?: LinkClickCountProperties) {
    super();
    this.initAttributes(props);
  }
}

export type MessageTrackingDataProperties = {
  messageId: string;
  payload: string;
  senderAppId: number;
  threadId?: string;
  replyToMessageId?: string;
  timestamp?: Date;
  count?: number;
  fromSelf?: boolean;
  recents?: LinkClickProperties[];
  linkData?: LinkClickCountProperties[];
};

export class MessageTrackingData extends Model
  implements MessageTrackingDataProperties {
  messageId = '';
  payload = '';
  senderAppId = 0;

  // thread.replied specific fields
  replyToMessageId?: string;
  timestamp?: Date;
  threadId?: string;
  fromSelf?: boolean;

  // message.opened specific field
  count?: number;

  // message.link_clicked specific fields
  linkData?: LinkClickCount[];

  // message.opened and message.link_clicked shared field
  recents?: LinkClick[];
  static attributes: Record<string, Attribute> = {
    messageId: Attributes.String({
      modelKey: 'messageId',
      jsonKey: 'message_id',
    }),
    payload: Attributes.String({
      modelKey: 'payload',
    }),
    senderAppId: Attributes.Number({
      modelKey: 'senderAppId',
      jsonKey: 'sender_app_id',
    }),
    replyToMessageId: Attributes.String({
      modelKey: 'replyToMessageId',
      jsonKey: 'reply_to_message_id',
    }),
    timestamp: Attributes.DateTime({
      modelKey: 'timestamp',
    }),
    threadId: Attributes.String({
      modelKey: 'threadId',
      jsonKey: 'thread_id',
    }),
    fromSelf: Attributes.Boolean({
      modelKey: 'fromSelf',
      jsonKey: 'from_self',
    }),
    count: Attributes.Number({
      modelKey: 'count',
    }),
    linkData: Attributes.Collection({
      modelKey: 'linkData',
      jsonKey: 'link_data',
      itemClass: LinkClickCount,
    }),
    recents: Attributes.Collection({
      modelKey: 'recents',
      itemClass: LinkClick,
    }),
  };

  constructor(props?: MessageTrackingDataProperties) {
    super();
    this.initAttributes(props);
  }
}

export type WebhookObjectExtrasProperties = {
  reason?: string;
  sendAt?: Date;
  originalSendAt?: Date;
};

export class WebhookObjectExtras extends Model
  implements WebhookObjectExtrasProperties {
  reason?: string;
  sendAt?: Date;
  originalSendAt?: Date;

  static attributes: Record<string, Attribute> = {
    reason: Attributes.String({
      modelKey: 'reason',
    }),
    sendAt: Attributes.DateTime({
      modelKey: 'sendAt',
      jsonKey: 'send_at',
    }),
    originalSendAt: Attributes.DateTime({
      modelKey: 'originalSendAt',
      jsonKey: 'original_send_at',
    }),
  };
}

export type WebhookObjectAttributesProperties = {
  action?: string;
  jobStatusId?: string;
  threadId?: string;
  receivedDate?: Date;
};

export class WebhookObjectAttributes extends Model
  implements WebhookObjectAttributesProperties {
  // Job Status specific fields
  action?: string;
  jobStatusId?: string;
  messageId?: string;
  extras?: WebhookObjectExtrasProperties;

  // Message specific fields
  threadId?: string;
  receivedDate?: Date;

  // Event specific fields
  calendarId?: string;
  createdBeforeAccountConnection?: boolean;
  static attributes: Record<string, Attribute> = {
    action: Attributes.String({
      modelKey: 'action',
    }),
    jobStatusId: Attributes.String({
      modelKey: 'jobStatusId',
      jsonKey: 'job_status_id',
    }),
    messageId: Attributes.String({
      modelKey: 'messageId',
      jsonKey: 'message_id',
    }),
    threadId: Attributes.String({
      modelKey: 'threadId',
      jsonKey: 'thread_id',
    }),
    calendarId: Attributes.String({
      modelKey: 'calendarId',
      jsonKey: 'calendar_id',
    }),
    receivedDate: Attributes.DateTime({
      modelKey: 'receivedDate',
      jsonKey: 'received_date',
    }),
    createdBeforeAccountConnection: Attributes.Boolean({
      modelKey: 'createdBeforeAccountConnection',
      jsonKey: 'created_before_account_connection',
    }),
    extras: Attributes.Object({
      modelKey: 'extras',
      itemClass: WebhookObjectExtras,
    }),
  };

  constructor(props?: WebhookObjectAttributesProperties) {
    super();
    this.initAttributes(props);
  }
}

export type WebhookObjectDataProperties = {
  id: string;
  accountId: string;
  namespaceId: string;
  object: string;
  metadata?: MessageTrackingDataProperties | Record<string, object>;
  objectAttributes?: WebhookObjectAttributesProperties;
};

export class WebhookObjectData extends Model
  implements WebhookObjectDataProperties {
  id = '';
  accountId = '';
  namespaceId = '';
  object = '';

  // Message specific field
  metadata?: MessageTrackingData | Record<string, object>;

  // Message and Job Status specific field
  objectAttributes?: WebhookObjectAttributes;
  static attributes: Record<string, Attribute> = {
    id: Attributes.String({
      modelKey: 'id',
    }),
    accountId: Attributes.String({
      modelKey: 'accountId',
      jsonKey: 'account_id',
    }),
    namespaceId: Attributes.String({
      modelKey: 'namespaceId',
      jsonKey: 'namespace_id',
    }),
    object: Attributes.String({
      modelKey: 'object',
    }),
    metadata: Attributes.Object({
      modelKey: 'metadata',
    }),
    objectAttributes: Attributes.Object({
      modelKey: 'objectAttributes',
      jsonKey: 'attributes',
      itemClass: WebhookObjectAttributes,
    }),
  };

  constructor(props?: WebhookObjectDataProperties) {
    super();
    this.initAttributes(props);
    if (
      this.metadata &&
      (this.object === 'message' || this.object === 'thread')
    ) {
      this.metadata = new MessageTrackingData(
        this.metadata as MessageTrackingDataProperties
      );
    }
  }

  fromJSON(json: Record<string, unknown>): this {
    const notification = super.fromJSON(json);
    if (
      notification.metadata &&
      (notification.object === 'message' || notification.object === 'thread')
    ) {
      notification.metadata = new MessageTrackingData().fromJSON(
        json['metadata'] as Record<string, unknown>
      );
    }
    return notification;
  }
}

export type WebhookDeltaProperties = {
  object: string;
  type: string;
  date: Date;
  objectData: WebhookObjectDataProperties;
};

export class WebhookDelta extends Model implements WebhookDeltaProperties {
  date = new Date();
  object = '';
  type = '';
  objectData = new WebhookObjectData();
  static attributes: Record<string, Attribute> = {
    date: Attributes.DateTime({
      modelKey: 'date',
    }),
    object: Attributes.String({
      modelKey: 'object',
    }),
    type: Attributes.String({
      modelKey: 'type',
    }),
    objectData: Attributes.Object({
      modelKey: 'objectData',
      jsonKey: 'object_data',
      itemClass: WebhookObjectData,
    }),
  };

  constructor(props?: WebhookDeltaProperties) {
    super();
    this.initAttributes(props);
  }
}

export type WebhookNotificationProperties = {
  deltas: WebhookDeltaProperties[];
};

export default class WebhookNotification extends Model
  implements WebhookNotificationProperties {
  deltas: WebhookDelta[] = [];
  static attributes: Record<string, Attribute> = {
    deltas: Attributes.Collection({
      modelKey: 'deltas',
      itemClass: WebhookDelta,
    }),
  };

  constructor(props?: WebhookNotificationProperties) {
    super();
    this.initAttributes(props);
  }
}
