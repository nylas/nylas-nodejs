import { AvailabilityRules, OpenHours } from './availability.js';
import { Conferencing } from './events.js';
import { Subset } from '../utils.js';

export type BookingType = 'booking' | 'organizer-confirmation';
export type BookingReminderType = 'email' | 'webhook';
export type BookingRecipientType = 'host' | 'guest' | 'all';

export interface BookingConfirmedTemplate {
  /**
   * The title to replace the default 'Booking Confirmed' title.
   * This doesn't change the email subject line. Only visible in emails sent to guests.
   */
  title?: string;
  /**
   * The additional body to be appended after the default body.
   * Only visible in emails sent to guests.
   */
  body?: string;
}

export interface EmailTemplate {
  /**
   * The URL to a custom logo that appears at the top of the booking email.
   * Replaces the default Nylas logo. The URL must be publicly accessible.
   */
  logo?: string;
  /**
   * Configurable settings specifically for booking confirmed emails.
   */
  bookingConfirmed?: BookingConfirmedTemplate;
}

export interface SchedulerSettings {
  /**
   * The definitions for additional fields to be displayed in the Scheduler UI.
   * Guest will see the additional fields on the Scheduling Page when they book an event.
   */
  additionalFields?: Record<string, string>;
  /**
   * The number of days in the future that Scheduler is available for scheduling events.
   */
  availableDaysInFuture?: number;
  /**
   * The minimum number of minutes in the future that a user can make a new booking.
   */
  minBookingNotice?: number;
  /**
   * The minimum number of minutes before a booking can be cancelled.
   */
  minCancellationNotice?: number;
  /**
   * A message about the cancellation policy to display to users when booking an event.
   */
  cancellationPolicy?: string;
  /**
   * The URL used to reschedule bookings. This URL is included in confirmation email messages.
   */
  reschedulingUrl?: string;
  /**
   * The URL used to cancel bookings. This URL is included in confirmation email messages.
   */
  cancellationUrl?: string;
  /**
   * The URL used to confirm or cancel pending bookings. This URL is included in booking request email messages.
   */
  organizerConfirmationUrl?: string;
  /**
   * The custom URL to redirect to once the booking is confirmed.
   */
  confirmationRedirectUrl?: string;
  /**
   * If true, the option to reschedule an event is hidden in booking confirmations and email notifications.
   */
  hideReschedulingOptions?: boolean;
  /**
   * If true, the option to cancel an event is hidden in booking confirmations and email notifications.
   */
  hideCancellationOptions?: boolean;
  /**
   * Whether to hide the Additional guests field on the Scheduling Page. If true, guests cannot invite additional guests to the event.
   */
  hideAdditionalGuests?: boolean;
  /**
   * Configurable settings for booking emails.
   */
  emailTemplate?: EmailTemplate;
}

export interface BookingReminder {
  type: BookingReminderType;
  minutesBeforeEvent: number;
  recipient?: BookingRecipientType;
  emailSubject?: string;
}

export interface EventBooking {
  title: string;
  description?: string;
  location?: string;
  timezone?: string;
  bookingType?: BookingType;
  conferencing?: Conferencing;
  disableEmails?: boolean;
  reminders?: BookingReminder[];
}

export interface Availability {
  durationMinutes: number;
  intervalMinutes?: number;
  roundTo?: number;
  availabilityRules?: Omit<AvailabilityRules, 'roundRobinEventId'>;
}

export interface ParticipantBooking {
  calendarId: string;
}

export interface ParticipantAvailability {
  /**
   * An optional list of the calendar IDs associated with each participant's email address.
   * If not provided, Nylas uses the primary calendar ID.
   */
  calendarIds: string[];
  /**
   * Open hours for this participant. The endpoint searches for free time slots during these open hours.
   */
  openHours?: OpenHours[];
}

/**
 * Interface representing a booking participant.
 */
export interface Participant {
  /**
   * Participant's email address.
   */
  email: string;
  availability: ParticipantAvailability;
  booking: ParticipantBooking;
  /**
   * Participant's name.
   */
  name?: string;
  isOrganizer?: boolean;
  timezone?: string;
}

export interface Configuration {
  participants: Participant[];
  availability: Availability;
  eventBooking: EventBooking;
  slug?: string;
  requiresSessionAuth?: boolean;
  scheduler?: SchedulerSettings;
  appearance?: Record<string, string>;
}

export type CreateConfigurationRequest = Configuration;
export type UpdateConfigurationRequest = Subset<Configuration>;

export interface CreateSessionRequest {
  configurationId?: string;
  slug?: string;
  timeToLive?: number;
}

export interface CreateSessionResponse {
  sessionId: string;
}
