import ManagementModel from './management-model';
import Attributes, { Attribute } from './attributes';
import { SaveCallback } from './restful-model';
import NylasConnection from '../nylas-connection';

export enum WebhookTriggers {
  AccountConnected = 'account.connected',
  AccountRunning = 'account.running',
  AccountStopped = 'account.stopped',
  AccountInvalid = 'account.invalid',
  AccountSyncError = 'account.sync_error',
  MessageBounced = 'message.bounced',
  MessageCreated = 'message.created',
  MessageOpened = 'message.opened',
  MessageUpdated = 'message.updated',
  MessageLinkClicked = 'message.link_clicked',
  ThreadReplied = 'thread.replied',
  ContactCreated = 'contact.created',
  ContactUpdated = 'contact.updated',
  ContactDeleted = 'contact.deleted',
  CalendarCreated = 'calendar.created',
  CalendarUpdated = 'calendar.updated',
  CalendarDeleted = 'calendar.deleted',
  EventCreated = 'event.created',
  EventUpdated = 'event.updated',
  EventDeleted = 'event.deleted',
  JobSuccessful = 'job.successful',
  JobFailed = 'job.failed',
}

export type WebhookProperties = {
  callbackUrl: string;
  state: string;
  triggers: string[];
  id?: string;
  applicationId?: string;
  version?: string;
};

export default class Webhook extends ManagementModel
  implements WebhookProperties {
  callbackUrl = '';
  state = '';
  triggers: string[] = [];
  id?: string;
  applicationId?: string;
  version?: string;
  static collectionName = 'webhooks';
  static attributes: Record<string, Attribute> = {
    id: Attributes.String({
      modelKey: 'id',
    }),

    applicationId: Attributes.String({
      modelKey: 'applicationId',
      jsonKey: 'application_id',
    }),

    callbackUrl: Attributes.String({
      modelKey: 'callbackUrl',
      jsonKey: 'callback_url',
    }),

    state: Attributes.String({
      modelKey: 'state',
    }),

    triggers: Attributes.StringList({
      modelKey: 'triggers',
    }),

    version: Attributes.String({
      modelKey: 'version',
    }),
  };

  constructor(
    connection: NylasConnection,
    clientId: string,
    props: WebhookProperties
  ) {
    super(connection, clientId, props);
    this.initAttributes(props);
  }

  pathPrefix(): string {
    return `/a/${this.clientId}`;
  }
  saveRequestBody(): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    // We can only update the state of an existing webhook
    if (this.id) {
      json['state'] = this.state;
    } else {
      json['callback_url'] = this.callbackUrl;
      json['state'] = this.state ? this.state : 'active';
      json['triggers'] = Webhook.attributes.triggers.toJSON(this.triggers);
    }
    return json;
  }
  save(params: {} | SaveCallback = {}, callback?: SaveCallback): Promise<this> {
    return super.save(params, callback);
  }
}
