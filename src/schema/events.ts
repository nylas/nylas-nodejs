import { z } from 'zod';

const TimeSchema = z.object({
  time: z.number(),
  timezone: z.string(),
});

const TimespanSchema = z.object({
  start_time: z.number(),
  end_time: z.number(),
  start_timezone: z.string(),
  end_timezone: z.string(),
});

const DateSchema = z.object({
  date: z.string(),
});

const DatespanSchema = z.object({
  start_date: z.string(),
  end_Date: z.string(),
});

const WebExSchema = z.object({
  password: z.string(),
  pin: z.string(),
  url: z.string(),
});

const ZoomMeetingSchema = z.object({
  meeting_code: z.string(),
  password: z.string(),
  url: z.string(),
});

const GoToMeetingSchema = z.object({
  meeting_code: z.string(),
  phone: z.array(z.string()),
  url: z.string(),
});

const GoogleMeetSchema = z.object({
  phone: z.string(),
  pin: z.string(),
  url: z.string(),
});

const DetailsSchema = z.object({
  provider: z.union([
    z.literal('WebEx'),
    z.literal('Zoom Meeting'),
    z.literal('GoToMeeting'),
    z.literal('Google Meet'),
  ]),
  details: z.union([
    WebExSchema,
    ZoomMeetingSchema,
    GoToMeetingSchema,
    GoogleMeetSchema,
  ]),
});

const AutocreateSchema = z.object({
  provider: z.union([
    z.literal('Google Meet'),
    z.literal('Zoom Meeting'),
    z.literal('Microsoft Teams'),
  ]),
  autocreate: z.any(),
});

const ParticipantSchema = z.object({
  name: z.string().optional(),
  email: z.string(),
  status: z.union([
    z.literal('noreply'),
    z.literal('yes'),
    z.literal('no'),
    z.literal('maybe'),
  ]),
  comment: z.string().optional(),
  phone_number: z.string().optional(),
});

const RecurrenceSchema = z.object({
  rrule: z.array(z.string()),
  timezone: z.string(),
});

const RemindersSchema = z.object({
  reminder_minutes: z.string().regex(/^\[-?\d+\]+$/),
  reminder_method: z.union([
    z.literal('email'),
    z.literal('popup'),
    z.literal('sound'),
    z.literal('display'),
  ]),
});

export const ListEventParamSchema = z.object({
  show_cancelled: z.boolean().optional(),
  limit: z.number().optional(),
  page_token: z.string().optional(),
  event_id: z.string().optional(),
  calendar_id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  end: z.string().optional(),
  start: z.string().optional(),
  metadata_pair: z.string().optional(),
  expand_recurring: z.boolean().optional(),
  busy: z.boolean().optional(),
  particpants: z.string().optional(),
});

export type ListEventParams = z.infer<typeof ListEventParamSchema>;

const CreateEventQueryParamsSchema = z.object({
  notify_participants: z.boolean(),
  calendar_id: z.string(),
});

export type CreateEventQueryParams = z.infer<
  typeof CreateEventQueryParamsSchema
>;

export const CreateEventRequestBodySchema = z.object({
  title: z
    .string()
    .min(1)
    .max(1024),
  busy: z.boolean(),
  description: z.string(),
  when: z.union([TimeSchema, TimespanSchema, DateSchema, DatespanSchema]),
  location: z.string().max(255),
  conferencing: z.union([DetailsSchema, AutocreateSchema]),
  reminder_minutes: z.string(),
  reminder_method: z.string(),
  metadata: z.record(z.string()),
  participants: z.array(ParticipantSchema),
  recurrence: RecurrenceSchema,
  calendar_id: z.string(),
  read_only: z.boolean(),
  round_robin_order: z.array(z.string()),
});

export type CreateEventRequestBody = z.infer<
  typeof CreateEventRequestBodySchema
>;

export const EventResponseSchema = z.object({
  busy: z.boolean(),
  description: z
    .string()
    .min(0)
    .max(8192)
    .optional(),
  location: z.string().optional(),
  participants: z.array(ParticipantSchema).nonempty(),
  title: z
    .string()
    .min(1)
    .max(1024),
  when: z.union([TimeSchema, TimespanSchema, DateSchema, DatespanSchema]),
  conferencing: z.union([DetailsSchema, AutocreateSchema]),
  recurrence: RecurrenceSchema,
  metadata: z.record(z.string()),
  account: z.string(),
  calendar_id: z.string(),
  ical_uid: z.string(),
  id: z.string(),
  object: z.union([
    z.literal('event'),
    z.literal('calendar'),
    z.literal('contact'),
    z.literal('file'),
    z.literal('message'),
    z.literal('label'),
  ]),
  owner: z.string(),
  read_only: z.boolean(),
  reminders: RemindersSchema,
  status: z.union([
    z.literal('confirmed'),
    z.literal('tentative'),
    z.literal('cancelled'),
  ]),
  visibility: z.union([z.literal('public'), z.literal('private')]).optional(),
  updated_at: z.number(),
  created_at: z.number(),
  html_link: z.string(),
});

export type Event = z.infer<typeof EventResponseSchema>;
