import { z } from 'zod';
import { APIObjects } from './utils';

const CreateCalenderRequestBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  location: z.string(),
  timezone: z.string(),
  metadata: z.record(z.string(), z.string()),
});

export type CreateCalenderRequestBody = z.infer<
  typeof CreateCalenderRequestBodySchema
>;

const ListCalenderParamSchema = z.object({
  limit: z
    .number()
    .max(200)
    .optional(),
  pageToken: z.string().optional(),
  metadataPair: z.string().optional(),
});

export type ListCalenderParams = z.infer<typeof ListCalenderParamSchema>;

const UpdateCalenderRequestBodySchema = z.object({
  ...CreateCalenderRequestBodySchema.shape,
  hexColor: z.string().optional(),
  hexForegroundColor: z.string().optional(),
});

export type UpdateCalenderRequestBody = z.infer<
  typeof UpdateCalenderRequestBodySchema
>;

const CalendarSchema = z.object({
  name: z.string(),
  description: z.string(),
  location: z.string(),
  timezone: z.string(),
  metadata: z.object({}),
  id: z.string(),
  grant_id: z.string(),
  object: APIObjects,
  read_only: z.boolean(),
  is_primary: z.boolean().nullable(),
  is_owned_by_user: z.boolean(),
  hex_color: z.string(),
  hex_foreground_color: z.string(),
});

export type Calendar = z.infer<typeof CalendarSchema>;
