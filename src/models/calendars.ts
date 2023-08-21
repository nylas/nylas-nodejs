import { ListQueryParams } from './listQueryParams.js';

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
}

/**
 * Interface of a Nylas update calendar request
 */
export interface UpdateCalenderRequest extends CreateCalenderRequest {
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
}
