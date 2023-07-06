export interface Webhook {
  id: string;
  description?: string;
  triggerTypes: WebhookTriggers[];
  callbackUrl: string;
  status: 'active' | 'failing' | 'failed' | 'pause';
  notificationEmailAddress?: string;
  statusUpdatedAt: number;
}

export interface WebhookWithSecret extends Webhook {
  webhookSecret: string;
}

export interface WebhookDeleteResponse {
  requestId: string;
  data?: {
    status: 'success';
  };
}

export interface WebhookIpAddressesResponse {
  ipAddresses: string[];
  updatedAt: number;
}

export interface CreateWebhookRequest {
  triggerTypes: WebhookTriggers[];
  callbackUrl: string;
  description?: string;
  notificationEmailAddress?: string;
}

export type UpdateWebhookRequestBody = Partial<CreateWebhookRequest>;

export enum WebhookTriggers {
  CalendarCreated = 'calendar.created',
  CalendarUpdated = 'calendar.updated',
  CalendarDeleted = 'calendar.deleted',
  EventCreated = 'event.created',
  EventUpdated = 'event.updated',
  EventDeleted = 'event.deleted',
  GrantCreated = 'grant.created',
  GrantUpdated = 'grant.updated',
  GrantDeleted = 'grant.deleted',
  GrantExpired = 'grant.expired',
  MessageSendSuccess = 'message.send_success',
  MessageSendFailed = 'message.send_failed',
}
