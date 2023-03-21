import { z } from 'zod';
import { APIObjects } from './utils';

export const CreateCalenderRequestBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  location: z.string(),
  timezone: z.string(),
  metadata: z.record(z.string(), z.string()),
});

export type CreateCalenderRequestBody = z.infer<
  typeof CreateCalenderRequestBodySchema
>;

export const ListCalenderParamsSchema = z.object({
  limit: z.number().optional(),
  pageToken: z.string().optional(),
  metadataPair: z.string().optional(),
});

export type ListCalenderParams = z.infer<typeof ListCalenderParamsSchema>;

export const UpdateCalenderRequestBodySchema = z.object({
  ...CreateCalenderRequestBodySchema.shape,
  hexColor: z.string().optional(),
  hexForegroundColor: z.string().optional(),
});

export type UpdateCalenderRequestBody = z.infer<
  typeof UpdateCalenderRequestBodySchema
>;

export const DestroyCalendarParamsSchema = z.object({
  calendarId: z.string(),
  notifyParticipants: z.boolean().optional(),
});

export type DestroyCalendarQueryParams = z.infer<
  typeof DestroyCalendarParamsSchema
>;

export const CalendarSchema = z.object({
  name: z.string(),
  description: z.string(),
  location: z.string(),
  timezone: z.string(),
  metadata: z.object({}),
  id: z.string(),
  grantId: z.string(),
  object: APIObjects,
  readOnly: z.boolean(),
  isPrimary: z.boolean().nullable(),
  isOwnedByUser: z.boolean(),
  hexColor: z.string(),
  hexForegroundColor: z.string(),
});

export type Calendar = z.infer<typeof CalendarSchema>;
