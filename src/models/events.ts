import { ListQueryParams } from './request';
import { Subset } from '../utils';

export interface Event {
  id: string;
  grantId: string;
  object: 'event';
  calendarId: string;
  busy: boolean;
  readOnly: boolean;
  createdAt: number;
  updatedAt: number;
  participants: Participant[];
  when: When;
  conferencing: Conferencing;
  description?: string;
  location?: string;
  messageId?: string;
  owner?: string;
  icalUid?: string;
  title?: string;
  htmlLink?: string;
  hideParticipants?: boolean;
  metadata?: Record<string, string>;
  creator?: EmailName;
  organizer: EmailName;
  recurrence?: Recurrence;
  reminders?: Reminder[];
  status?: Status;
  visibility?: Visibility;
}

export interface CreateEventRequest {
  when: When;
  title?: string;
  busy?: boolean;
  description?: string;
  location?: string;
  conferencing?: Conferencing;
  reminderMinutes?: string;
  reminderMethod?: string;
  metadata?: Record<string, unknown>;
  participants?: Participant[];
  recurrence?: Recurrence;
  calendarId?: string;
  readOnly?: boolean;
  roundRobinOrder?: string[];
  visibility?: 'public' | 'private';
  capacity?: number;
  hideParticipants?: boolean;
}

export type UpdateEventRequest = Subset<CreateEventRequest>;

export interface ListEventQueryParams extends ListQueryParams {
  showCancelled?: boolean;
  eventId?: string;
  calendarId: string;
  title?: string;
  description?: string;
  location?: string;
  end?: string;
  start?: string;
  metadataPair?: Record<string, unknown>;
  expandRecurring?: boolean;
  busy?: boolean;
  participants?: string;
}

export interface CreateEventQueryParams {
  calendarId: string;
  notifyParticipants?: boolean;
}

export interface FindEventQueryParams {
  calendarId: string;
}

export type UpdateEventQueryParams = CreateEventQueryParams;
export type DestroyEventQueryParams = CreateEventQueryParams;

type Status = 'confirmed' | 'tentative' | 'cancelled';
type Visibility = 'public' | 'private';
type ConferencingProvider =
  | 'Google Meet'
  | 'Zoom Meeting'
  | 'Microsoft Teams'
  | 'GoToMeeting'
  | 'WebEx';
type ParticipantStatus = 'noreply' | 'yes' | 'no' | 'maybe';
type ReminderMethod = 'email' | 'popup' | 'sound' | 'display';
type Conferencing = Details | Autocreate;
type When = Time | Timespan | Date | Datespan;

export interface Details {
  provider: ConferencingProvider;
  details: DetailsConfig;
}

export interface DetailsConfig {
  meetingCode?: string;
  password?: string;
  url?: string;
  pin?: string;
  phone?: string[];
}

export interface Autocreate {
  provider: ConferencingProvider;
  autocreate: Record<string, unknown>;
}

export interface Time {
  time: number;
  timezone: string;
}

export interface Timespan {
  startTime: number;
  endTime: number;
  startTimezone: string;
  endTimezone: string;
}

export interface Date {
  date: string;
}

export interface Datespan {
  startDate: string;
  endDate: string;
}

export interface Participant {
  email: string;
  name?: string;
  status: ParticipantStatus;
  comment?: string;
  phoneNumber?: string;
}

export interface Recurrence {
  rrule: string[];
  timezone: string;
}

export interface Reminder {
  reminderMinutes: string;
  reminderMethod: ReminderMethod;
}

export interface EmailName {
  email: string;
  name?: string;
}
