import Model from './model';
import Attributes, { Attribute } from './attributes';

export type FreeBusyQuery = {
  startTime: number;
  endTime: number;
  emails?: string[];
  calendars?: FreeBusyCalendarProperties[];
};

export type FreeBusyCalendarProperties = {
  accountId: string;
  calendarIds: string[];
};

export class FreeBusyCalendar extends Model
  implements FreeBusyCalendarProperties {
  accountId = '';
  calendarIds: string[] = [];
  static attributes: Record<string, Attribute> = {
    accountId: Attributes.String({
      modelKey: 'accountId',
      jsonKey: 'account_id',
    }),
    calendarIds: Attributes.StringList({
      modelKey: 'calendarIds',
      jsonKey: 'calendar_ids',
    }),
  };

  constructor(props?: FreeBusyCalendarProperties) {
    super();
    this.initAttributes(props);
  }
}

export type TimeSlotCapacityProperties = {
  eventId: string;
  currentCapacity: number;
  maxCapacity: number;
};

export class TimeSlotCapacity extends Model
  implements TimeSlotCapacityProperties {
  eventId = '';
  currentCapacity = 0;
  maxCapacity = 0;
  static attributes: Record<string, Attribute> = {
    eventId: Attributes.String({
      modelKey: 'eventId',
      jsonKey: 'event_id',
    }),
    currentCapacity: Attributes.Number({
      modelKey: 'currentCapacity',
      jsonKey: 'current_capacity',
    }),
    maxCapacity: Attributes.Number({
      modelKey: 'maxCapacity',
      jsonKey: 'max_capacity',
    }),
  };

  constructor(props?: TimeSlotCapacityProperties) {
    super();
    this.initAttributes(props);
  }
}

export type TimeSlotProperties = {
  status: string;
  startTime: number;
  endTime: number;
  emails?: string[];
  capacity?: TimeSlotCapacityProperties;
};

export class TimeSlot extends Model implements TimeSlotProperties {
  object = 'time_slot';
  status = '';
  startTime = 0;
  endTime = 0;
  emails?: string[];
  capacity?: TimeSlotCapacity;
  static attributes: Record<string, Attribute> = {
    object: Attributes.String({
      modelKey: 'object',
    }),
    status: Attributes.String({
      modelKey: 'status',
    }),
    startTime: Attributes.Number({
      modelKey: 'startTime',
      jsonKey: 'start_time',
    }),
    endTime: Attributes.Number({
      modelKey: 'endTime',
      jsonKey: 'end_time',
    }),
    emails: Attributes.StringList({
      modelKey: 'emails',
    }),
    capacity: Attributes.Object({
      modelKey: 'capacity',
      itemClass: TimeSlotCapacity,
    }),
  };

  constructor(props?: TimeSlotProperties) {
    super();
    this.initAttributes(props);
  }
}

export type FreeBusyProperties = {
  email: string;
  timeSlots: TimeSlotProperties[];
};

export default class FreeBusy extends Model implements FreeBusyProperties {
  object = 'free_busy';
  email = '';
  timeSlots: TimeSlot[] = [];
  static attributes: Record<string, Attribute> = {
    object: Attributes.String({
      modelKey: 'object',
    }),
    email: Attributes.String({
      modelKey: 'email',
    }),
    timeSlots: Attributes.Collection({
      modelKey: 'timeSlots',
      jsonKey: 'time_slots',
      itemClass: TimeSlot,
    }),
  };

  constructor(props?: FreeBusyProperties) {
    super();
    this.initAttributes(props);
  }
}
