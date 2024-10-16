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
  /**
   * The reminder type.
   */
  type: BookingReminderType;
  /**
   * The number of minutes before the event to send the reminder.
   */
  minutesBeforeEvent: number;
  /**
   * The recipient of the reminder.
   */
  recipient?: BookingRecipientType;
  /**
   * The subject of the email reminder.
   */
  emailSubject?: string;
}

export interface EventBooking {
  /**
   * The title of the event.
   */
  title: string;
  /**
   * The description of the event.
   */
  description?: string;
  /**
   * The location of the event.
   */
  location?: string;
  /**
   * The timezone for displaying the times in confirmation email messages and reminders.
   */
  timezone?: string;
  /**
   * The type of booking. If set to booking, Scheduler follows the standard booking flow and instantly creates the event.
   * If set to organizer-confirmation, Scheduler creates an event marked "Pending" in the organizer's calendar and sends
   * an confirmation request email to the organizer.
   * The confirmation request email includes a link to a page where the organizer can confirm or cancel the booking.
   */
  bookingType?: BookingType;
  /**
   * An object that allows you to automatically create a conference or enter conferencing details manually.
   */
  conferencing?: Conferencing;
  /**
   * If true, Nylas doesn't send any email messages when an event is booked, cancelled, or rescheduled.
   */
  disableEmails?: boolean;
  /**
   * The list of reminders to send to participants before the event starts.
   */
  reminders?: BookingReminder[];
}

export interface Availability {
  /**
   * The total number of minutes the event should last.
   */
  durationMinutes: number;
  /**
   * The interval between meetings in minutes.
   */
  intervalMinutes?: number;
  /**
   * Nylas rounds each time slot to the nearest multiple of this number of minutes.
   * Must be a multiple of 5.
   */
  roundTo?: number;
  /**
   * Availability rules for the scheduling configuration.
   * These rules define how Nylas calculates availability for all participants.
   */
  availabilityRules?: Omit<AvailabilityRules, 'roundRobinEventId'>;
}

export interface ParticipantBooking {
  /**
   * The calendar ID that the event is created in.
   */
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
export interface ConfigParticipant {
  /**
   * Participant's email address.
   */
  email: string;
  /**
   * The availability data for the participant.
   * If omitted, the participant is considered to be available at all times.
   * At least one participant must have availability data.
   */
  availability: ParticipantAvailability;
  /**
   * The booking data for the participant.
   * If omitted, the participant is not included in the booked event.
   * At least one participant must have booking data.
   */
  booking: ParticipantBooking;
  /**
   * Participant's name.
   */
  name?: string;
  /**
   * Whether the participant is the organizer of the event.
   * For non-round-robin meetings, one of the participants must be specified as an organizer.
   */
  isOrganizer?: boolean;
  /**
   * The participant's timezone.
   * This is used when calculating the participant's open hours and in email notifications.
   */
  timezone?: string;
}

export interface Configuration {
  /**
   * The list of participants that is included in the scheduled event.
   * All participants must have a valid Nylas grant.
   */
  participants: ConfigParticipant[];
  /**
   * The rules that determine the available time slots for the event.
   */
  availability: Availability;
  /**
   * The booking data for the event.
   */
  eventBooking: EventBooking;
  /**
   * The slug of the Configuration object. This is an optional, unique identifier for the Configuration object.
   */
  slug?: string;
  /**
   * If true, the scheduling Availability and Bookings endpoints require a valid session ID to authenticate requests when you use this configuration.
   */
  requiresSessionAuth?: boolean;
  /**
   * The settings for the Scheduler UI.
   */
  scheduler?: SchedulerSettings;
  /**
   * The appearance settings for the Scheduler UI.
   */
  appearance?: Record<string, string>;
}

export type CreateConfigurationRequest = Configuration;
export type UpdateConfigurationRequest = Subset<Configuration>;

export interface CreateSessionRequest {
  /**
   * The ID of the Scheduler Configuration object for the session.
   * If you're using slug, you can omit this field.
   */
  configurationId?: string;
  /**
   * The slug of the Scheduler Configuration object for the session.
   * If you're using configurationId, you can omit this field.
   */
  slug?: string;
  /**
   * The time to live for the session in minutes.
   * The maximum value is 30 minutes.
   */
  timeToLive?: number;
}

export interface Session {
  /**
   * The ID of the session
   */
  sessionId: string;
}

/**
 * The supported languages for email notifications.
 */
export type EmailLanguage =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'nl'
  | 'sv'
  | 'ja'
  | 'zh';

export interface BookingGuest {
  /**
   * The email address of the guest.
   */
  email: string;
  /**
   * The name of the guest.
   */
  name: string;
}

export interface BookingParticipant {
  /**
   * The email address of the participant to include in the booking.
   */
  email: string;
}

/**
 * Interface representing a create booking request.
 */
export interface CreateBookingRequest {
  /**
   * The event's start time, in Unix epoch format.
   */
  startTime: string;
  /**
   * The event's end time, in Unix epoch format.
   */
  endTime: string;
  /**
   * Details about the guest that is creating the booking. The guest name and email are required.
   */
  guest: BookingGuest;
  /**
   * An array of objects that include a list of participant email addresses from the Configuration object to include in the booking.
   * If not provided, Nylas includes all participants from the Configuration object.
   */
  participants?: BookingParticipant[];
  /**
   * The guest's timezone that is used in email notifications.
   * If not provided, Nylas uses the timezone from the Configuration object.
   */
  timezone?: string;
  /**
   * The language of the guest email notifications.
   */
  emailLanguage?: EmailLanguage;
  /**
   * An array of objects that include a list of additional guest email addresses to include in the booking.
   */
  additionalGuests?: BookingGuest[];
  /**
   * A dictionary of additional field keys mapped to the values populated by the guest in the booking form.
   */
  additionalFields?: Record<string, string>;
}

export interface BookingOrganizer {
  /**
   * The email address of the participant that is designated as the organizer of the event.
   */
  email: string;
  /**
   * The name of the participant that is designated as the organizer of the event.
   */
  name?: string;
}

export type BookingStatus = 'pending' | 'booked' | 'cancelled';
export type ConfirmBookingStatus = 'confirmed' | 'cancelled';

export interface Booking {
  /**
   * The unique ID of the booking
   */
  bookingId: string;
  /**
   * The unique ID of the event associated with the booking
   */
  eventId: string;
  /**
   * The title of the event
   */
  title: string;
  /**
   * The participant that is designated as the organizer of the event
   */
  organizer: BookingOrganizer;
  /**
   * The current status of the booking
   */
  status: BookingStatus;
  /**
   * The description of the event
   */
  description?: string;
}

export interface ConfirmBookingRequest {
  /**
   * The salt extracted from the booking reference embedded in the organizer confirmation link,
   * encoded as a URL-safe base64 string (without padding).
   */
  salt: string;
  /**
   * The action to take on the pending booking
   */
  status: ConfirmBookingStatus;
  /**
   * The reason that the booking is being cancelled
   */
  cancellationReason?: string;
}

export interface DeleteBookingRequest {
  /**
   * The reason that the booking is being cancelled
   */
  cancellationReason?: string;
}

export interface RescheduleBookingRequest {
  /**
   * The event's start time, in Unix epoch format.
   */
  startTime: string;
  /**
   * The event's end time, in Unix epoch format.
   */
  endTime: string;
}
