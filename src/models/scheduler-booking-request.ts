import RestfulModel from './restful-model';
import Attributes from './attributes';
import SchedulerTimeSlot from './scheduler-time-slot';

export class SchedulerBookingConfirmation extends RestfulModel {
  id?: string;
  accountId?: string;
  additionalFieldValues?: object;
  calendarEventId?: string;
  calendarId?: string;
  editHash?: string;
  startTime?: Date;
  endTime?: Date;
  isConfirmed?: boolean;
  location?: string;
  recipientEmail?: string;
  recipientLocale?: string;
  recipientName?: string;
  recipientTz?: string;
  title?: string;
}
SchedulerBookingConfirmation.collectionName = 'booking_confirmation';
SchedulerBookingConfirmation.attributes = {
  id: Attributes.Number({
    modelKey: 'id',
  }),
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
  startTime: Attributes.DateTime({
    modelKey: 'startTime',
    jsonKey: 'start_time',
  }),
  endTime: Attributes.DateTime({
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
  title: Attributes.String({
    modelKey: 'title',
  }),
};

export default class SchedulerBookingRequest extends RestfulModel {
  additionalEmails?: string[];
  additionalValues?: object;
  email?: string;
  locale?: string;
  name?: string;
  pageHostname?: string;
  replacesBookingHash?: string;
  slot?: SchedulerTimeSlot;
  timezone?: string;
}
SchedulerBookingRequest.collectionName = 'booking_request';
SchedulerBookingRequest.attributes = {
  additionalEmails: Attributes.StringList({
    modelKey: 'additionalEmails',
    jsonKey: 'additional_emails',
  }),
  additionalValues: Attributes.Object({
    modelKey: 'additionalValues',
    jsonKey: 'additional_values',
  }),
  email: Attributes.String({
    modelKey: 'email',
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
    itemClass: SchedulerTimeSlot,
  }),
  timezone: Attributes.String({
    modelKey: 'timezone',
  }),
};
