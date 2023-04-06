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

const WebhookSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  triggerTypes: z.array(z.nativeEnum(WebhookTriggers)),
  callbackUrl: z.string(),
  status: z.union([
    z.literal('active'),
    z.literal('failing'),
    z.literal('failed'),
    z.literal('pause'),
  ]),
  notificationEmailAddress: z.string(),
  statusUpdatedAt: z.number(),
});
const WebhookWithSecretSchema = WebhookSchema.extend({
  webhookSecret: z.string(),
});

export type Webhook = z.infer<typeof WebhookSchema>;
export type WebhookWithSecret = z.infer<typeof WebhookWithSecretSchema>;
export const WebhookResponseSchema = ItemResponseSchema.extend({
  data: WebhookSchema,
});
export const WebhookResponseWithSecretSchema = ItemResponseSchema.extend({
  data: WebhookWithSecretSchema,
});
export const WebhookListResponseSchema = ListResponseSchema.extend({
  data: z.array(WebhookSchema),
});
export type WebhookList = z.infer<typeof WebhookListResponseSchema>;

const WebhookIpAddressesSchema = z.object({
  ipAddresses: z.array(z.string()),
  updatedAt: z.number(),
});
export const WebhookIpAddressesResponseSchema = ItemResponseSchema.extend({
  data: WebhookIpAddressesSchema,
});
export type WebhookIpAddresses = z.infer<typeof WebhookIpAddressesSchema>;
