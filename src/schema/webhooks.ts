export interface Webhook {
  id: string;
  description?: string;
  trigger_types: WebhookTriggers[];
  callback_url: string;
  status: 'active' | 'failing' | 'failed' | 'pause';
  notification_email_address?: string;
  status_updated_at: number;
}

export interface WebhookWithSecret extends Webhook {
  webhook_secret: string;
}

export interface WebhookDeleteResponse {
  request_id: string;
  data?: {
    status: 'success';
  };
}

export interface WebhookIpAddressesResponse {
  ip_addresses: string[];
  updated_at: number;
}

export interface CreateWebhookRequest {
  trigger_types: WebhookTriggers[];
  callback_url: string;
  description?: string;
  notification_email_address?: string;
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
