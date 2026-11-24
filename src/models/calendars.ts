import { ListQueryParams } from './listQueryParams.js';
import {
  NotetakerConfigSettingsResponse,
  NotetakerDeduplicationPolicy,
  NotetakerSyncSettings,
  NotetakerMeetingSettings,
} from './notetakers.js';

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
 * A criterion for which events a calendar's Notetaker joins.
 * "all": Events with meeting links.
 * "internal": Events where the host's domain matches all participants' domains.
 * "external": Events where the host's domain differs from any participant's domain.
 * "own_events": Events where the user's grant is the host.
 * "participant_only": Events where the user's grant is a participant but not the host.
 */
export type CalendarNotetakerEventSelection =
  'all' | 'internal' | 'external' | 'own_events' | 'participant_only';

/**
 * Interface for Calendar Notetaker rules
 */
export interface CalendarNotetakerRules {
  /**
   * Types of events to include for notetaking.
   * Each item is a single criterion or a group of criteria.
   * Top-level items are OR'd together, and criteria inside a group are AND'd.
   * Each group needs at least one criterion.
   * For example, `['internal', ['own_events', 'external']]` matches internal events,
   * or events the user hosts that have at least one external participant.
   */
  eventSelection?: Array<
    CalendarNotetakerEventSelection | CalendarNotetakerEventSelection[]
  >;
  /**
   * Filters to apply based on the number of participants. This is an intersection with the event_selection.
   * When null, there are no restrictions on the number of participants for notetaker events.
   */
  participantFilter?: CalendarNotetakerParticipantFilter;
}

/**
 * Interface for Calendar Notetaker settings.
 * Use one of `notetakerSettings`, `configId`, `autocreate`, or the deprecated
 * `name` and `meetingSettings`. Combining them returns a validation error.
 * `rules` can be combined with `notetakerSettings` or the deprecated fields.
 *
 * Build update requests from the fields you want to set. A fetched calendar's
 * `notetaker` object can carry resolved values, such as stored image metadata,
 * that the API rejects on writes.
 */
export interface CalendarNotetaker {
  /**
   * The display name for the Notetaker bot.
   * @default "Nylas Notetaker"
   * @deprecated Use `notetakerSettings.name` instead.
   */
  name?: string;
  /**
   * Notetaker Meeting Settings
   * @deprecated Use `notetakerSettings` instead.
   */
  meetingSettings?: NotetakerMeetingSettings;
  /**
   * Settings for the Notetakers that join this calendar's events.
   * Nylas saves them as a calendar configuration.
   * Requests replace the whole `notetaker` object. Include these settings when
   * you update `rules`: a `notetaker` object with only `rules` replaces the
   * calendar's settings with legacy defaults.
   */
  notetakerSettings?: NotetakerSyncSettings;
  /**
   * The ID of an application or workspace Notetaker configuration to apply to this calendar.
   */
  configId?: string;
  /**
   * When true, Nylas creates Notetakers for matching events using the settings
   * inherited from your configurations. Cannot be combined with `rules`.
   */
  autocreate?: true;
  /**
   * Whether Notetakers created from this calendar take part in deduplication.
   * "inherit": Use the policy from your configurations.
   * "disable": Opt this calendar out of deduplication.
   * Only valid with `notetakerSettings`. Updates that omit it reset it to
   * "inherit", so send it again to keep an opt-out.
   */
  deduplicationPolicy?: 'inherit' | 'disable';
  /**
   * Rules for when the Notetaker should join a meeting.
   */
  rules?: CalendarNotetakerRules;
}

/**
 * Calendar Notetaker settings as returned in Calendar responses.
 * Calendar reads return resolved `notetakerSettings` that include settings
 * inherited from workspace and application configurations. Create and update
 * responses return the settings you sent. Responses can carry values the API
 * rejects on writes, so this type can't be passed straight into a create or
 * update request. Build the request from the fields you want to set.
 */
export interface CalendarNotetakerResponse extends Omit<
  CalendarNotetaker,
  'notetakerSettings' | 'autocreate' | 'deduplicationPolicy'
> {
  /**
   * Settings for the Notetakers that join this calendar's events. In calendar
   * reads these are resolved and include inherited values.
   */
  notetakerSettings?: NotetakerConfigSettingsResponse;
  /**
   * Only in create and update responses, which return the settings you sent.
   * Calendar reads don't include it.
   */
  autocreate?: boolean;
  /**
   * This calendar's own deduplication policy. "inherit" means a parent
   * configuration decides, so it doesn't say whether deduplication is active.
   */
  deduplicationPolicy?: NotetakerDeduplicationPolicy;
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
  notetaker?: CalendarNotetakerResponse;
}
