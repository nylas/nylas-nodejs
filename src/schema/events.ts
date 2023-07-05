import { ListQueryParams } from './request';

export interface Event {
  id: string;
  grant_id: string;
  object: 'event';
  calendar_id: string;
  busy: boolean;
  read_only: boolean;
  created_at: number;
  updated_at: number;
  participants: Participant[];
  when: When;
  conferencing: Conferencing;
  description?: string;
  location?: string;
  message_id?: string;
  owner?: string;
  ical_uid?: string;
  title?: string;
  html_link?: string;
  hide_participants?: boolean;
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
  reminder_minutes?: string;
  reminder_method?: string;
  metadata?: Record<string, unknown>;
  participants?: Participant[];
  recurrence?: Recurrence;
  calendar_id?: string;
  read_only?: boolean;
  round_robin_order?: string[];
  visibility?: 'public' | 'private';
  capacity?: number;
  hide_participants?: boolean;
}

export type UpdateEventRequest = Subset<CreateEventRequest>;

export interface ListEventQueryParams extends ListQueryParams {
  show_cancelled?: boolean;
  event_id?: string;
  calendar_id: string;
  title?: string;
  description?: string;
  location?: string;
  end?: string;
  start?: string;
  metadata_pair?: Record<string, unknown>;
  expand_recurring?: boolean;
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
type ConferencingProvider = 'Google Meet' | 'Zoom Meeting' | 'Microsoft Teams' | 'GoToMeeting' | 'WebEx';
type ParticipantStatus = 'noreply' | 'yes' | 'no' | 'maybe';
type ReminderMethod = 'email' | 'popup' | 'sound' | 'display';
type Conferencing = Details | Autocreate;
type When = Time | Timespan | Date | Datespan;

export interface Details {
  provider: ConferencingProvider;
  details: DetailsConfig;
}

export interface DetailsConfig {
  meeting_code?: string;
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
  start_time: number;
  end_time: number;
  start_timezone: string;
  end_timezone: string;
}

export interface Date {
  date: string;
}

export interface Datespan {
  start_date: string;
  end_date: string;
}

export interface Participant {
  email: string;
  name?: string;
  status: ParticipantStatus;
  comment?: string;
  phone_number?: string;
}

export interface Recurrence {
  rrule: string[];
  timezone: string;
}

export interface Reminder {
  reminder_minutes: string;
  reminder_method: ReminderMethod;
}

export interface EmailName {
  email: string;
  name?: string;
}
