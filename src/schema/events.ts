import { z } from 'zod';
import { ListQueryParams } from './request';
import { ItemResponseSchema, ListResponseSchema } from './response';
import { APIObjects } from './utils';

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

type Time = z.infer<typeof TimeSchema>;
type Timespan = z.infer<typeof TimespanSchema>;
type Date = z.infer<typeof DateSchema>;
type Datespan = z.infer<typeof DatespanSchema>;
type Details = z.infer<typeof DetailsSchema>;
type Autocreate = z.infer<typeof AutocreateSchema>;
type Participant = z.infer<typeof ParticipantSchema>;
type Recurrence = z.infer<typeof RecurrenceSchema>;

export interface ListEventQueryParams extends ListQueryParams {
  showCancelled?: boolean;
  eventId?: string;
  calendarId: string;
  title?: string;
  description?: string;
  location?: string;
  end?: string;
  start?: string;
  metadataPair?: Record<string, string>;
  expandRecurring?: boolean;
  busy?: boolean;
  particpants?: string;
}

export interface CreateEventQueryParams {
  calendarId: string;
  notifyParticipants?: boolean;
}

export interface CreateEventRequestBody {
  title: string;
  busy: boolean;
  description: string;
  when: Time | Timespan | Date | Datespan;
  location: string;
  conferencing: Details | Autocreate;
  reminderMinutes: string;
  reminderMethod: string;
  metadata: Record<string, string>;
  participants: Participant[];
  recurrence: Recurrence;
  calendarId: string;
  readOnly: boolean;
  roundRobinOrder: string[];
  visibility: 'public' | 'private';
  capacity: number;
  hideParticipants: boolean;
}

export interface FindEventQueryParams {
  calendarId: string;
}

export type UpdateEventQueryParams = CreateEventQueryParams;
export type UpdateEventRequestBody = CreateEventRequestBody;

export type DestroyEventQueryParams = CreateEventQueryParams;

const EventSchema = z.object({
  busy: z.boolean(),
  description: z.string().optional(),
  location: z.string().optional(),
  participants: z.array(ParticipantSchema).nonempty(),
  title: z.string(),
  when: z.union([TimeSchema, TimespanSchema, DateSchema, DatespanSchema]),
  conferencing: z.union([DetailsSchema, AutocreateSchema]),
  recurrence: RecurrenceSchema,
  metadata: z.record(z.string()),
  account: z.string(),
  calendar_id: z.string(),
  ical_uid: z.string(),
  id: z.string(),
  object: APIObjects,
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

export const EventResponseSchema = ItemResponseSchema.extend({
  data: EventSchema,
});
export const EventListResponseSchema = ListResponseSchema.extend({
  data: z.array(EventSchema),
});

export type Event = z.infer<typeof EventSchema>;
