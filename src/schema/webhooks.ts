import { z } from 'zod';
import { ItemResponseSchema, ListResponseSchema } from './response';

export interface CreateWebhookRequestBody {
  triggerTypes: WebhookTriggers[];
  callbackUrl: string;
  description?: string;
  notificationEmailAddress?: string;
}

export type UpdateWebhookRequestBody = Partial<CreateWebhookRequestBody>;

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

const WebhookSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  triggerTypes: z.array(z.nativeEnum(WebhookTriggers)).nonempty(),
  callbackUrl: z.string(),
  webhookSecret: z.string(),
  status: z.union([
    z.literal('active'),
    z.literal('failing'),
    z.literal('failed'),
    z.literal('pause'),
  ]),
  notificationEmailAddress: z.string(),
  statusUpdatedAt: z.number(),
});

export type Webhook = z.infer<typeof WebhookSchema>;
export const WebhookResponseSchema = ItemResponseSchema.extend({
  data: WebhookSchema,
});
export const WebhookListResponseSchema = ListResponseSchema.extend({
  data: z.array(WebhookSchema),
});
export type WebhookList = z.infer<typeof WebhookListResponseSchema>;
