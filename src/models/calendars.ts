import { ListQueryParams } from './listQueryParams.js';
import { NotetakerMeetingSettings } from './notetakers.js';

/**
 * Interface for Calendar Notetaker participant filter
 */
export interface CalendarNotetakerParticipantFilter {
  /**
   * Only have meeting bot join meetings with greater than or equal to this number of participants
   */
  participantsGte?: number;
  /**
   * Only have meeting bot join meetings with less than or equal to this number of participants
   */
  participantsLte?: number;
}

/**
 * Interface for Calendar Notetaker rules
 */
export interface CalendarNotetakerRules {
  /**
   * Types of events to include for notetaking. This is a union of events that should have a Notetaker sent to them.
   * "internal": Events where the host domain matches all participants' domain names
   * "external": Events where the host domain differs from any participant's domain name
   * "own_events": Events where the host is the same as the user's grant
   * "participant_only": Events where the user's grant is a participant but not the host
   * "all": When all options are included, all events with meeting links will have Notetakers
   */
  eventSelection?: Array<'internal' | 'external' | 'all' | 'ownEvents' | 'participantOnly'>;
  /**
   * Filters to apply based on the number of participants. This is an intersection with the event_selection.
   * When null, there are no restrictions on the number of participants for notetaker events.
   */
  participantFilter?: CalendarNotetakerParticipantFilter;
}

/**
 * Interface for Calendar Notetaker settings
 */
export interface CalendarNotetaker {
  /**
   * The display name for the Notetaker bot.
   * @default "Nylas Notetaker"
   */
  name?: string;
  /**
   * Notetaker Meeting Settings
   */
  meetingSettings?: NotetakerMeetingSettings;
  /**
   * Rules for when the Notetaker should join a meeting.
   */
  rules?: CalendarNotetakerRules;
}

/**
 * Interface of the query parameters for listing calendars.
 */
export interface ListCalendersQueryParams extends ListQueryParams {
  /**
   * The maximum number of objects to return.
   * This field defaults to 50. The maximum allowed value is 200.
   */
  limit?: number;
  /**
   * An identifier that specifies which page of data to return.
   * This value should be taken from the [ListResponse.nextCursor] response field.
   */
  pageToken?: string;
  /**
   * Pass in your metadata key and value pair to search for metadata.
   */
  metadataPair?: Record<string, string>;
}

/**
 * Interface of a Nylas create calendar request
 */
export interface CreateCalenderRequest {
  /**
   * Name of the Calendar.
   */
  name: string;
  /**
   * Description of the calendar.
   */
  description?: string;
  /**
   * Geographic location of the calendar as free-form text.
   */
  location?: string;
  /**
   * IANA time zone database formatted string (e.g. America/New_York).
   * @see <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones">List of tz database time zones</a>
   */
  timezone?: string;
  /**
   *  A list of key-value pairs storing additional data.
   */
  metadata?: Record<string, string>;
  /**
   * Notetaker meeting bot settings
   */
  notetaker?: CalendarNotetaker;
}

/**
 * Interface of a Nylas update calendar request
 */
export interface UpdateCalenderRequest extends Partial<CreateCalenderRequest> {
  /**
   * The background color of the calendar in the hexadecimal format (e.g. #0099EE).
   * Empty indicates default color.
   */
  hexColor?: string;
  /**
   * The background color of the calendar in the hexadecimal format (e.g. #0099EE).
   * Empty indicates default color. (Google only)
   */
  hexForegroundColor?: string;
}

/**
 * Interface of a Nylas calendar object
 */
export interface Calendar {
  /**
   * Globally unique object identifier.
   */
  id: string;
  /**
   * Grant ID of the Nylas account.
   */
  grantId: string;
  /**
   * Name of the Calendar.
   */
  name: string;
  /**
   * The type of object.
   */
  object: string;
  /**
   * IANA time zone database formatted string (e.g. America/New_York).
   * @see <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones">List of tz database time zones</a>
   */
  timezone: string;
  /**
   * If the event participants are able to edit the event.
   */
  readOnly: boolean;
  /**
   * If the calendar is owned by the user account.
   */
  isOwnedByUser: boolean;
  /**
   * Description of the calendar.
   */
  description?: string;
  /**
   * Geographic location of the calendar as free-form text.
   */
  location?: string;
  /**
   * The background color of the calendar in the hexadecimal format (e.g. #0099EE).
   * Empty indicates default color.
   */
  hexColor?: string;
  /**
   * The background color of the calendar in the hexadecimal format (e.g. #0099EE).
   * Empty indicates default color. (Google only)
   */
  hexForegroundColor?: string;
  /**
   * If the calendar is the primary calendar.
   */
  isPrimary?: boolean;
  /**
   * A list of key-value pairs storing additional data.
   */
  metadata?: Record<string, unknown>;
  /**
   * Notetaker meeting bot settings
   */
  notetaker?: CalendarNotetaker;
}
