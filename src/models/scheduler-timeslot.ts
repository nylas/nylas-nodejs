import RestfulModel from './restful-model';
import Attributes from './attributes';

export class BookingConfirmation extends RestfulModel {
  accountId?: string;
  additionalFieldValues?: object;
  calendarEventId?: string;
  calendarId?: string;
  editHash?: string;
  startTime?: number;
  endTime?: number;
  isConfirmed?: boolean;
  location?: string;
  recipientEmail?: string;
  recipientLocale?: string;
  recipientName?: string;
  recipientTz?: string;
  title?: string;
}
BookingConfirmation.collectionName = 'booking_confirmation';
BookingConfirmation.attributes = {
  accountId: Attributes.String({
    modelKey: 'accountId',
    jsonKey: 'account_id',
  }),
  additionalFieldValues: Attributes.Object({
    modelKey: 'additionalFieldValues',
    jsonKey: 'additional_field_values',
  }),
  calendarEventId: Attributes.String({
    modelKey: 'calendarEventId',
    jsonKey: 'calendar_event_id',
  }),
  calendarId: Attributes.String({
    modelKey: 'calendarId',
    jsonKey: 'calendar_id',
  }),
  editHash: Attributes.String({
    modelKey: 'editHash',
    jsonKey: 'edit_hash',
  }),
  startTime: Attributes.Number({
    modelKey: 'startTime',
    jsonKey: 'start_time',
  }),
  endTime: Attributes.Number({
    modelKey: 'endTime',
    jsonKey: 'end_time',
  }),
  isConfirmed: Attributes.Boolean({
    modelKey: 'isConfirmed',
    jsonKey: 'is_confirmed',
  }),
  location: Attributes.String({
    modelKey: 'location',
  }),
  recipientEmail: Attributes.String({
    modelKey: 'recipientEmail',
    jsonKey: 'recipient_email',
  }),
  recipientLocale: Attributes.String({
    modelKey: 'recipientLocale',
    jsonKey: 'recipient_locale',
  }),
  recipientName: Attributes.String({
    modelKey: 'recipientName',
    jsonKey: 'recipient_name',
  }),
  recipientTz: Attributes.String({
    modelKey: 'recipientTz',
    jsonKey: 'recipient_tz',
  }),
  title: Attributes.Number({
    modelKey: 'title',
  }),
};

export class SchedulerSlot extends RestfulModel {
  accountId?: string;
  calendarId?: string;
  hostName?: string;
  emails?: string[];
  start?: number;
  end?: number;

  toJSON(): Record<string, any> {
    return {
      account_id: this.accountId,
      calendar_id: this.calendarId,
      emails: this.emails,
      start: this.start,
      end: this.end,
    };
  }
}
SchedulerSlot.collectionName = 'scheduler_slot';
SchedulerSlot.attributes = {
  accountId: Attributes.String({
    modelKey: 'accountId',
    jsonKey: 'account_id',
  }),
  calendarId: Attributes.String({
    modelKey: 'calendarId',
    jsonKey: 'calendar_id',
  }),
  hostName: Attributes.String({
    modelKey: 'hostName',
    jsonKey: 'host_name',
  }),
  emails: Attributes.StringList({
    modelKey: 'emails',
  }),
  start: Attributes.Number({
    modelKey: 'start',
  }),
  end: Attributes.Number({
    modelKey: 'end',
  }),
};

export default class SchedulerTimeslot extends RestfulModel {
  additionalEmails?: string[];
  additionalValues?: object;
  email?: string;
  locale?: string;
  name?: string;
  pageHostname?: string;
  replacesBookingHash?: string;
  slot?: SchedulerSlot;
  timezone?: string;
}
SchedulerTimeslot.collectionName = 'scheduler_timeslot';
SchedulerTimeslot.attributes = {
  additionalEmails: Attributes.StringList({
    modelKey: 'additionalEmails',
    jsonKey: 'additional_emails',
  }),
  additionalValues: Attributes.Object({
    modelKey: 'additionalValues',
    jsonKey: 'additional_values',
  }),
  emails: Attributes.String({
    modelKey: 'emails',
  }),
  locale: Attributes.String({
    modelKey: 'locale',
  }),
  name: Attributes.String({
    modelKey: 'name',
  }),
  pageHostname: Attributes.String({
    modelKey: 'pageHostname',
    jsonKey: 'page_hostname',
  }),
  replacesBookingHash: Attributes.String({
    modelKey: 'replacesBookingHash',
    jsonKey: 'replaces_booking_hash',
  }),
  slot: Attributes.Object({
    modelKey: 'slot',
    itemClass: SchedulerSlot,
  }),
  timezone: Attributes.String({
    modelKey: 'timezone',
  }),
};
