/**
 * Interface representation of a Nylas free-busy time slot object.
 */
export interface FreeBusyTimeSlot {
  /**
   * Unix timestamp for the start of the slot.
   */
  startTime: number;
  /**
   * Unix timestamp for the end of the slot.
   */
  endTime: number;
  /**
   * The status of the time slot.
   */
  status: string;
}

/**
 * Class representation of a Nylas get free-busy request
 */
export interface GetFreeBusyRequest {
  /**
   * Unix timestamp representing the start of the time block for assessing the account's free/busy schedule.
   */
  startTime: number;
  /**
   * Unix timestamp representing the end of the time block for assessing the account's free/busy schedule.
   */
  endTime: number;
  /**
   * A list of email addresses to check the free/busy schedules for.
   */
  emails: string[];
}

/**
 * Enum representing the type of free/busy information returned for a calendar.
 */
export enum FreeBusyType {
  FREE_BUSY = 'free_busy',
  ERROR = 'error',
}

/**
 * Union type of the possible Nylas get free busy response.
 */
export type GetFreeBusyResponse = FreeBusy | FreeBusyError;

/**
 * This interface represents a successful free-busy response.
 */
export interface FreeBusy {
  /**
   * The participant's email address.
   */
  email: string;
  /**
   * A list of busy time slots.
   */
  timeSlots: FreeBusyTimeSlot[];
  /**
   * The type of the response.
   */
  object: FreeBusyType.FREE_BUSY;
}

/**
 * This interface represents a failed free-busy response.
 */
export interface FreeBusyError {
  /**
   * The participant's email address.
   */
  email: string;
  /**
   * Description of the error fetching data for this participant.
   */
  error: string;
  /**
   * The type of the response.
   */
  object: FreeBusyType.ERROR;
}
