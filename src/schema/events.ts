import { z } from 'zod';
import { ListQueryParams } from './request';
import { ItemResponseSchema, ListResponseSchema } from './response';
import { APIObjects } from './utils';

const TimeSchema = z.object({
  time: z.number(),
  timezone: z.string(),
});

const TimespanSchema = z.object({
  startTime: z.number(),
  endTime: z.number(),
  startTimezone: z.string(),
  endTimezone: z.string(),
});

const DateSchema = z.object({
  date: z.string(),
});

const DatespanSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

const WebExSchema = z.object({
  provider: z.literal('WebEx'),
  details: z.object({
    password: z.string(),
    pin: z.string(),
    url: z.string(),
  }),
});

const ZoomMeetingSchema = z.object({
  provider: z.literal('Zoom Meeting'),
  details: z.object({
    meetingCode: z.string(),
    password: z.string(),
    url: z.string(),
  }),
});

const GoToMeetingSchema = z.object({
  provider: z.literal('GoToMeeting'),
  details: z.object({
    meetingCode: z.string(),
    phone: z.array(z.string()),
    url: z.string(),
  }),
});

const GoogleMeetSchema = z.object({
  provider: z.literal('Google Meet'),
  details: z.object({
    phone: z.string(),
    pin: z.string(),
    url: z.string(),
  }),
});

const DetailsSchema = z.union([
  WebExSchema,
  ZoomMeetingSchema,
  GoToMeetingSchema,
  GoogleMeetSchema,
]);

const AutocreateSchema = z.object({
  provider: z.union([
    z.literal('Google Meet'),
    z.literal('Zoom Meeting'),
    z.literal('Microsoft Teams'),
  ]),
  autocreate: z.any(), // TODO: FIX
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
  phoneNumber: z.string().optional(),
});

const RecurrenceSchema = z.object({
  rrule: z.array(z.any()), // TODO: FIX
  timezone: z.string(),
});

const RemindersSchema = z.object({
  reminderMinutes: z.string().regex(/^\[-?\d+\]+$/),
  reminderMethod: z.union([
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
  accountId: z.string().optional(),
  grantId: z.string().optional(),
  busy: z.boolean(),
  calendarId: z.string(),
  capacity: z.number().optional(),
  conferencing: z.union([DetailsSchema, AutocreateSchema]).optional(),
  createdAt: z.number().optional(),
  description: z.string().nullable(),
  hideParticipants: z.boolean().optional(),
  icalUid: z.string().optional(),
  id: z.string(),
  location: z.string().optional(),
  messageId: z.string().nullable(),
  metadata: z.record(z.string()).optional(),
  object: APIObjects,
  owner: z.string().optional(),
  organizer: z.any().optional(), // TODO: FIX
  participants: z.array(ParticipantSchema),
  providerArgs: z.any().optional(), // TODO: FIX
  readOnly: z.boolean(),
  recurrence: RecurrenceSchema.optional(),
  reminderMinutes: z.any().optional(), // TODO: FIX
  reminderMethod: z.string().optional(),
  reminders: RemindersSchema.nullable(),
  status: z
    .union([
      z.literal('confirmed'),
      z.literal('tentative'),
      z.literal('cancelled'),
    ])
    .optional(),
  title: z.string().optional(),
  updatedAt: z.number().optional(),
  visibility: z.union([z.literal('public'), z.literal('private')]).optional(),
  when: z.union([TimeSchema, TimespanSchema, DateSchema, DatespanSchema]),
  creator: z.any().optional(), // TODO: FIX
  htmlLink: z.string().optional(),
});

export const EventResponseSchema = ItemResponseSchema.extend({
  data: EventSchema,
});
export const EventListResponseSchema = ListResponseSchema.extend({
  data: z.array(EventSchema),
});

export type Event = z.infer<typeof EventSchema>;
