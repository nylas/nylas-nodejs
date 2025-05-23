import { Subset } from '../utils.js';
import { NylasApiErrorResponseData } from './error.js';
import { ListQueryParams } from './listQueryParams.js';
import { NylasBaseResponse } from './response.js';
import { NotetakerMeetingSettings } from './notetakers.js';

/**
 * Interface representing Notetaker settings
 */
export interface NotetakerSettings {
  /**
   * The display name for the Notetaker bot.
   * Default: Nylas Notetaker
   */
  name?: string;
  /**
   * Notetaker Meeting Settings
   */
  meetingSettings?: NotetakerMeetingSettings;
}

/**
 * Interface representing a Nylas Event object.
 */
export interface Event {
  /**
   * Globally unique object identifier.
   */
  id: string;
  /**
   * Grant ID of the Nylas account.
   */
  grantId: string;
  /**
   * The type of object.
   */
  object: 'event';
  /**
   * Calendar ID of the event.
   */
  calendarId: string;
  /**
   * This value determines whether to show this event's time block as available on shared or public calendars.
   */
  busy: boolean;
  /**
   * If the event participants are able to edit the event.
   */
  readOnly: boolean;
  /**
   * List of participants invited to the event. Participants may also be rooms or resources.
   */
  participants: Participant[];
  /**
   * Representation of time and duration for events. When object can be in one of four formats (sub-objects):
   * - {@link Date}
   * - {@link Datespan}
   * - {@link Time}
   * - {@link Timespan}
   */
  when: When;
  /**
   * Representation of conferencing details for events. Conferencing object can be in one of two formats (sub-objects):
   * - {@link Autocreate}
   * - {@link Details}
   */
  conferencing: Conferencing;
  /**
   * Visibility of the event, if the event is private or public.
   */
  visibility: Visibility;
  /**
   * Description of the event.
   */
  description?: string;
  /**
   * Location of the event, such as a physical address or meeting room name.
   */
  location?: string;
  /**
   * Unique id for iCalendar standard, for identifying events across calendaring systems.
   * Recurring events may share the same value. Can be null for events synced before the year 2020.
   */
  icalUid?: string;
  /**
   * Title of the event.
   */
  title?: string;
  /**
   * A link to this event in the provider's UI
   */
  htmlLink?: string;
  /**
   * Whether participants of the event should be hidden.
   */
  hideParticipants?: boolean;
  /**
   * List of key-value pairs storing additional data.
   */
  metadata?: Record<string, string>;
  /**
   * User who created the event.
   * Not supported for all providers.
   */
  creator?: EmailName;
  /**
   * Organizer of the event.
   */
  organizer?: EmailName;
  /**
   * An list of RRULE and EXDATE strings.
   * @see <a href="https://datatracker.ietf.org/doc/html/rfc5545#section-3.8.5">RFC-5545</a>
   */
  recurrence?: string[];
  /**
   * A list of reminders to send for the event. If left empty or omitted, the event uses the provider defaults.
   */
  reminders?: Reminders;
  /**
   * Status of the event.
   */
  status?: Status;
  /**
   * Unix timestamp when the event was created.
   */
  createdAt?: number;
  /**
   * Unix timestamp when the event was last updated.
   */
  updatedAt?: number;
  /**
   * Master event id if recurring events.
   */
  masterEventId?: string;
  /**
   * Notetaker meeting bot settings
   */
  notetaker?: NotetakerSettings;
}

/**
 * Interface representing a request to create an event.
 */
export interface CreateEventRequest {
  /**
   * Representation of time and duration for events. When object can be in one of four formats (sub-objects):
   * - {@link Date}
   * - {@link Datespan}
   * - {@link Time}
   * - {@link Timespan}
   */
  when: CreateWhen;
  /**
   * Title of the event.
   */
  title?: string;
  /**
   * This value determines whether to show this event's time block as available on shared or public calendars.
   */
  busy?: boolean;
  /**
   * Description of the event.
   */
  description?: string;
  /**
   * Location of the event, such as a physical address or meeting room name.
   */
  location?: string;
  /**
   * Representation of conferencing details for events. Conferencing object can be in one of two formats (sub-objects):
   * - {@link Autocreate}
   * - {@link Details}
   */
  conferencing?: Conferencing;
  /**
   * A list of reminders to send for the event. If left empty or omitted, the event uses the provider defaults.
   */
  reminders?: Reminders;
  /**
   *  A list of key-value pairs storing additional data.
   */
  metadata?: Record<string, unknown>;
  /**
   * List of participants invited to the event. Participants may also be rooms or resources.
   */
  participants?: Participant[];
  /**
   * An list of RRULE and EXDATE strings.
   * @see <a href="https://datatracker.ietf.org/doc/html/rfc5545#section-3.8.5">RFC-5545</a>
   */
  recurrence?: string[];
  /**
   * Calendar ID of the event.
   */
  calendarId?: string;
  /**
   * If the event participants are able to edit the event.
   */
  readOnly?: boolean;
  /**
   * Visibility of the event, if the event is private or public.
   */
  visibility?: 'public' | 'private';
  /**
   * The maximum number of participants that may attend the event.
   */
  capacity?: number;
  /**
   * Whether participants of the event should be hidden.
   */
  hideParticipants?: boolean;
  /**
   * Notetaker meeting bot settings
   */
  notetaker?: NotetakerSettings;
}

/**
 * Interface representing a request to update an event.
 */
export type UpdateEventRequest = Subset<CreateEventRequest>;

/**
 * Interface representing a request to send RSVP to an event.
 */
export type SendRsvpRequest = {
  status: RsvpStatus;
};

/**
 * Interface representing the response from sending RSVP to an event.
 * @property sendIcsError If the send-rsvp request succeeded but the ICS email could not be sent, this will contain the error.
 */
export interface SendRsvpResponse extends NylasBaseResponse {
  sendIcsError?: NylasApiErrorResponseData;
}

/**
 * Interface representing the query parameters for listing events.
 */
export interface ListEventQueryParams extends ListQueryParams {
  /**
   * Return events that have a status of cancelled.
   * If an event is recurring, then it returns no matter the value set.
   * Different providers have different semantics for cancelled events.
   */
  showCancelled?: boolean;
  /**
   * Specify calendar ID of the event. "primary" is a supported value indicating the user's primary calendar.
   */
  calendarId: string;
  /**
   * Return events matching the specified title.
   */
  title?: string;
  /**
   * Return events matching the specified description.
   * Graph: NOT supported
   */
  description?: string;
  /**
   * Return events matching the specified location.
   */
  location?: string;
  /**
   * Return events ending before the specified unix timestamp.
   * Defaults to a month from now. Not respected by metadata filtering.
   */
  end?: string;
  /**
   * Return events starting after the specified unix timestamp.
   * Defaults to the current timestamp. Not respected by metadata filtering.
   */
  start?: string;
  /**
   * Pass in your metadata key and value pair to search for metadata.
   */
  metadataPair?: Record<string, unknown>;
  /**
   * If true, the response will include an event for each occurrence of a recurring event within the requested time range.
   * If false, only a single primary event will be returned for each recurring event.
   * Cannot be used when filtering on metadata.
   * Defaults to false.
   */
  expandRecurring?: boolean;
  /**
   * Returns events with a busy status of true.
   */
  busy?: boolean;
  /**
   * Order results by the specified field.
   * Currently only start is supported.
   */
  orderBy?: string;
  /**
   * The maximum number of objects to return.
   * This field defaults to 50. The maximum allowed value is 200.
   */
  limit?: number;
  /**
   * An identifier that specifies which page of data to return.
   * This value should be taken from the {@link NylasListResponse.nextCursor} response field.
   */
  pageToken?: string;
  /**
   * (Google only) Filter events by event type.
   * You can pass the query parameter multiple times to select or exclude multiple event types.
   */
  eventType?: EventType[];
  /**
   * Filter for events that include the specified attendees.
   * Not supported for virtual calendars.
   */
  attendees?: string[];
  /**
   * Master event id if recurring events.
   */
  masterEventId?: string;
  /**
   * When set to false, treats tentative calendar events as busy:false.
   * Only applicable for Microsoft and EWS calendar providers. Defaults to true.
   */
  tentativeAsBusy?: boolean;
}

/**
 * Interface representing of the query parameters for creating an event.
 */
export interface CreateEventQueryParams {
  /**
   * The ID of the calendar to create the event in.
   */
  calendarId: string;
  /**
   * Email notifications containing the calendar event is sent to all event participants.
   */
  notifyParticipants?: boolean;
  /**
   * When set to false, treats tentative calendar events as busy:false.
   * Only applicable for Microsoft and EWS calendar providers. Defaults to true.
   */
  tentativeAsBusy?: boolean;
}

/**
 * Interface representing of the query parameters for finding an event.
 */
export interface FindEventQueryParams {
  /**
   * Calendar ID to find the event in. "primary" is a supported value indicating the user's primary calendar.
   */
  calendarId: string;
  /**
   * When set to false, treats tentative calendar events as busy:false.
   * Only applicable for Microsoft and EWS calendar providers. Defaults to true.
   */
  tentativeAsBusy?: boolean;
}

/**
 * Interface representing of the query parameters for updating events.
 */
export type UpdateEventQueryParams = CreateEventQueryParams;

/**
 * Interface representing of the query parameters for destroying events.
 */
export type DestroyEventQueryParams = CreateEventQueryParams;

/**
 * Interface representing of the query parameters for sending RSVP to an event.
 */
export type SendRsvpQueryParams = FindEventQueryParams;

/**
 * Interface representing the query parameters for importing events.
 */
export interface ListImportEventQueryParams extends ListQueryParams {
  /**
   * (Required) Calendar ID to import events from. "primary" is a supported value indicating the user's primary calendar.
   * Note: "primary" is not supported for iCloud.
   */
  calendarId: string;
  /**
   * Filter for events that start at or after the specified time, in Unix timestamp format.
   * Defaults to the time of the request.
   */
  start?: number;
  /**
   * Filter for events that end at or before the specified time, in Unix timestamp format.
   * Defaults to one month from the time of the request.
   */
  end?: number;
}

/**
 * Enum representing the status of an event.
 */
type Status = 'confirmed' | 'maybe' | 'cancelled';

/**
 * Enum representing the status of an RSVP response.
 */
type RsvpStatus = 'yes' | 'no' | 'maybe';

/**
 * Enum representing the visibility of an event.
 */
type Visibility = 'default' | 'public' | 'private';

/**
 * Enum representing the supported conferencing providers.
 */
type ConferencingProvider =
  | 'Google Meet'
  | 'Zoom Meeting'
  | 'Microsoft Teams'
  | 'GoToMeeting'
  | 'WebEx';

/**
 * Enum representing the status of an event participant.
 */
type ParticipantStatus = 'noreply' | 'yes' | 'no' | 'maybe';

/**
 * Enum representing the different types of reminders.
 */
type ReminderMethod = 'email' | 'popup' | 'sound' | 'display';

/**
 * Type representing the different conferencing objects.
 */
export type Conferencing = Details | Autocreate;

/**
 * Type representing the different objects representing time and duration for events.
 */
type When = Time | Timespan | Date | Datespan;

/**
 * Type representing the different objects representing time and duration when creating events.
 */
type CreateWhen =
  | Omit<Time, 'object'>
  | Omit<Timespan, 'object'>
  | Omit<Date, 'object'>
  | Omit<Datespan, 'object'>;

/**
 * Enum representing the different types of when objects.
 */
export enum WhenType {
  Time = 'time',
  Timespan = 'timespan',
  Date = 'date',
  Datespan = 'datespan',
}

/**
 * Interface of a conferencing details object
 */
export interface Details {
  /**
   * The conferencing provider
   */
  provider: ConferencingProvider;

  /**
   * The conferencing details
   */
  details: DetailsConfig;
}

/**
 * Interface of a the configuration for a conferencing object
 */
export interface DetailsConfig {
  /**
   * The conferencing meeting code. Used for Zoom.
   */
  meetingCode?: string;
  /**
   * The conferencing meeting password. Used for Zoom.
   */
  password?: string;
  /**
   * The conferencing meeting url.
   */
  url?: string;
  /**
   * The conferencing meeting pin. Used for Google Meet.
   */
  pin?: string;
  /**
   * The conferencing meeting phone numbers. Used for Google Meet.
   */
  phone?: string[];
}

/**
 * Class representation of a conferencing autocreate object
 */
export interface Autocreate {
  /**
   * The conferencing provider
   */
  provider: ConferencingProvider;
  /**
   * Empty dict to indicate an intention to autocreate a video link.
   * Additional provider settings may be included in autocreate.settings, but Nylas does not validate these.
   */
  autocreate: Record<string, unknown>;
}

/**
 * Class representation of a specific point in time.
 * A meeting at 2pm would be represented as a time subobject.
 */
export interface Time {
  /**
   * A UNIX timestamp representing the time of occurrence.
   */
  time: number;
  /**
   * If timezone is present, then the value for time will be read with timezone.
   * Timezone using IANA formatted string. (e.g. "America/New_York")
   * @see <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones">List of tz database time zones</a>
   */
  timezone: string;
  /**
   * The type of 'when' object.
   */
  object: WhenType.Time;
}

/**
 * Class representation of a time span with start and end times.
 * An hour lunch meeting would be represented as timespan subobjects.
 */
export interface Timespan {
  /**
   * The start time of the event.
   */
  startTime: number;
  /**
   * The end time of the event.
   */
  endTime: number;
  /**
   * The timezone of the start time.
   * Timezone using IANA formatted string. (e.g. "America/New_York")
   * @see <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones">List of tz database time zones</a>
   */
  startTimezone?: string;
  /**
   * The timezone of the end time.
   * Timezone using IANA formatted string. (e.g. "America/New_York")
   * @see <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones">List of tz database time zones</a>
   */
  endTimezone?: string;
  /**
   * The type of 'when' object.
   */
  object: WhenType.Timespan;
}

/**
 * Class representation of an entire day spans without specific times.
 * Your birthday and holidays would be represented as date subobjects.
 */
export interface Date {
  /**
   * Date of occurrence in ISO 8601 format.
   * @see <a href="https://en.wikipedia.org/wiki/ISO_8601#Calendar_dates">ISO 8601</a>
   */
  date: string;
  /**
   * The type of 'when' object.
   */
  object: WhenType.Date;
}

/**
 * Class representation of a specific dates without clock-based start or end times.
 * A business quarter or academic semester would be represented as datespan subobjects.
 */
export interface Datespan {
  /**
   * The start date in ISO 8601 format.
   * @see <a href="https://en.wikipedia.org/wiki/ISO_8601#Calendar_dates">ISO 8601</a>
   */
  startDate: string;
  /**
   * The end date in ISO 8601 format.
   * @see <a href="https://en.wikipedia.org/wiki/ISO_8601#Calendar_dates">ISO 8601</a>
   */
  endDate: string;
  /**
   * The type of 'when' object.
   */
  object: WhenType.Datespan;
}

/**
 * Interface representing an Event participant.
 */
export interface Participant {
  /**
   * Participant's email address.
   */
  email: string;
  /**
   * Participant's name.
   */
  name?: string;
  /**
   * Participant's status.
   */
  status: ParticipantStatus;
  /**
   * Comment by the participant.
   */
  comment?: string;
  /**
   * Participant's phone number.
   */
  phoneNumber?: string;
}

/**
 * Interface representing the reminders field of an event.
 */
export interface Reminders {
  /**
   * Whether to use the default reminders for the calendar.
   * When true, uses the default reminder settings for the calendar
   */
  useDefault: boolean;
  /**
   * A list of reminders for the event if useDefault is set to false.
   */
  overrides: ReminderOverride[];
}

/**
 * Interface representing the reminder details for an event.
 */
export interface ReminderOverride {
  /**
   * The number of minutes before the event start time when a user wants a reminder for this event.
   * Reminder minutes are in the following format: "[20]".
   */
  reminderMinutes: number;
  /**
   * Method to remind the user about the event. (Google only).
   */
  reminderMethod: ReminderMethod;
}

/**
 * Interface representing an email address and optional name.
 */
export interface EmailName {
  /**
   * Email address.
   */
  email: string;
  /**
   * Full name.
   */
  name?: string;
}

/**
 * Type representing the event type to filter by.
 */
export type EventType =
  | 'default'
  | 'outOfOffice'
  | 'focusTime'
  | 'workingLocation';
