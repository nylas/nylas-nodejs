/**
 * Interface for a Nylas get availability response
 */
export interface GetAvailabilityResponse {
  /**
   * This property is only populated for round-robin events.
   * It will contain the order in which the accounts would be next in line to attend the proposed meeting.
   */
  order: string[];
  /**
   * The available time slots where a new meeting can be created for the requested preferences.
   */
  timeSlots: TimeSlot[];
}

/**
 * Interface for a Nylas get availability request
 */
export interface GetAvailabilityRequest {
  /**
   * Unix timestamp for the start time to check availability for.
   */
  startTime: number;
  /**
   * Unix timestamp for the end time to check availability for.
   */
  endTime: number;
  /**
   * Participant details to check availability for.
   */
  participants: AvailabilityParticipant[];
  /**
   * The total number of minutes the event should last.
   */
  durationMinutes: number;
  /**
   * Nylas checks from the nearest interval of the passed [startTime].
   * For example, to schedule 30-minute meetings ([durationMinutes]) with 15 minutes between them ([intervalMinutes]).
   * If you have a meeting starting at 9:59, the API returns times starting at 10:00. 10:00-10:30, 10:15-10:45.
   */
  intervalMinutes?: number;

  /**
   * The number of minutes to round the time slots to.
   * This allows for rounding to any multiple of 5 minutes, up to a maximum of 60 minutes.
   * The default value is set to 15 minutes.
   * When this variable is assigned a value, it overrides the behavior of the {@link roundTo30Minutes} flag, if it was set.
   */
  roundTo?: number;
  /**
   * The rules to apply when checking availability.
   */
  availabilityRules?: AvailabilityRules;
  /**
   * When set to true, the availability time slots will start at 30 minutes past or on the hour.
   * For example, a free slot starting at 16:10 is considered available only from 16:30.
   * @deprecated Use {@link roundTo} instead.
   */
  roundTo30Minutes?: boolean;
}

/**
 * Interface for a Nylas availability time slot
 */
export interface TimeSlot {
  /**
   * The emails of the participants who are available for the time slot.
   */
  emails: string[];
  /**
   * Unix timestamp for the start of the slot.
   */
  startTime: string;
  /**
   * Unix timestamp for the end of the slot.
   */
  endTime: string;
}

/**
 * Interface for the availability rules for a Nylas calendar.
 */
export interface AvailabilityRules {
  /**
   * The method used to determine availability for a meeting.
   */
  availabilityMethod?: AvailabilityMethod;
  /**
   * The buffer to add to the start and end of a meeting.
   */
  buffer?: MeetingBuffer;
  /**
   * A default set of open hours to apply to all participants.
   * You can overwrite these open hours for individual participants by specifying [AvailabilityParticipant.openHours]
   * on the participant object.
   */
  defaultOpenHours?: OpenHours[];
  /**
   * The ID on events that Nylas considers when calculating the order of round-robin participants.
   * This is used for both max-fairness and max-availability methods.
   */
  roundRobinEventId?: string;
}

/**
 * Interface for the meeting buffer object within an availability request.
 */
export interface MeetingBuffer {
  /**
   * The amount of buffer time in increments of 5 minutes to add before existing meetings.
   * Defaults to 0.
   */
  before: number;
  /**
   * The amount of buffer time in increments of 5 minutes to add after existing meetings.
   * Defaults to 0.
   */
  after: number;
}

/**
 * Interface of a participant's open hours.
 */
export interface OpenHours {
  /**
   * The days of the week that the open hour settings will be applied to.
   * Sunday corresponds to 0 and Saturday corresponds to 6.
   */
  days: number[];
  /**
   * IANA time zone database formatted string (e.g. America/New_York).
   * @see <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones">List of tz database time zones</a>
   */
  timezone: string;
  /**
   * Start time in 24-hour time format. Leading 0's are left off.
   */
  start: string;
  /**
   * End time in 24-hour time format. Leading 0's are left off.
   */
  end: string;
  /**
   * A list of dates that will be excluded from the open hours.
   * Dates should be formatted as YYYY-MM-DD.
   */
  exdates: string[];
}

/**
 * Interface of participant details to check availability for.
 */
export interface AvailabilityParticipant {
  /**
   * The email address of the participant.
   */
  email: string;
  /**
   * An optional list of the calendar IDs associated with each participant's email address.
   * If not provided, Nylas uses the primary calendar ID.
   */
  calendarIds?: string[];
  /**
   * Open hours for this participant. The endpoint searches for free time slots during these open hours.
   */
  openHours?: OpenHours[];
}

/**
 * Enum representing the method used to determine availability for a meeting.
 */
export enum AvailabilityMethod {
  MaxFairness = 'max-fairness',
  MaxAvailability = 'max-availability',
  Collective = 'collective',
}
