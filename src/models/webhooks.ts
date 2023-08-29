/**
 * Interface representing a Nylas Webhook object.
 */
export interface Webhook {
  /**
   * Globally unique object identifier.
   */
  id: string;
  /**
   * List of events that triggers the webhook.
   */
  triggerTypes: WebhookTriggers[];
  /**
   * The url to send webhooks to.
   */
  callbackUrl: string;
  /**
   * The status of the new destination.
   */
  status: 'active' | 'failing' | 'failed' | 'pause';
  /**
   * The time the status field was last updated, represented as a Unix timestamp in seconds.
   */
  statusUpdatedAt: number;
  /**
   * The time the status field was created, represented as a Unix timestamp in seconds
   */
  createdAt: number;
  /**
   * The time the status field was last updated, represented as a Unix timestamp in seconds.
   */
  updatedAt: number;
  /**
   * A human-readable description of the webhook destination.
   */
  description?: string;
  /**
   * The email addresses that Nylas notifies when a webhook is down for a while.
   */
  notificationEmailAddress?: string;
}

/**
 * Class representing a Nylas webhook with secret.
 */
export interface WebhookWithSecret extends Webhook {
  /**
   * A secret value used to encode the X-Nylas-Signature header on webhook requests.
   */
  webhookSecret: string;
}

/**
 * Class representing a Nylas webhook delete response.
 */
export interface WebhookDeleteResponse {
  /**
   * ID of the request.
   */
  requestId: string;
  /**
   * Object containing the webhook deletion status.
   */
  data?: {
    /**
     * The status of the webhook deletion.
     */
    status: 'success';
  };
}

/**
 * Class representing the response for getting a list of webhook ip addresses.
 */
export interface WebhookIpAddressesResponse {
  /**
   * The IP addresses that Nylas send you webhook from.
   */
  ipAddresses: string[];
  /**
   * UNIX timestamp when Nylas updated the list of IP addresses.
   */
  updatedAt: number;
}

/**
 * Class representation of a Nylas create webhook request.
 */
export interface CreateWebhookRequest {
  /**
   * Select the event that triggers the webhook.
   */
  triggerTypes: WebhookTriggers[];
  /**
   * The url to send webhooks to.
   */
  callbackUrl: string;
  /**
   * A human-readable description of the webhook destination.
   */
  description?: string;
  /**
   * The email addresses that Nylas notifies when a webhook is down for a while.
   */
  notificationEmailAddress?: string;
}

/**
 * Class representation of a Nylas update webhook request.
 */
export type UpdateWebhookRequest = Partial<CreateWebhookRequest>;

/**
 * Enum representing the available webhook triggers.
 */
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
