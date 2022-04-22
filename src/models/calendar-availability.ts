import Model from './model';
import Attributes, { Attribute } from './attributes';
import {
  FreeBusyProperties,
  TimeSlot,
  TimeSlotProperties,
  FreeBusyCalendarProperties,
} from './free-busy';

export enum RoundRobin {
  MaxAvailability = 'max-availability',
  MaxFairness = 'max-fairness',
}

export enum Days {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}

type AvailabilityQuery = {
  duration: number;
  interval: number;
  startTime: number;
  endTime: number;
  buffer?: number;
  tentativeBusy?: boolean;
  freeBusy?: FreeBusyProperties[];
  openHours?: OpenHoursProperties[];
  calendars?: FreeBusyCalendarProperties[];
};

export type SingleAvailabilityQuery = AvailabilityQuery & {
  emails?: string[];
  eventCollectionId?: string;
  roundRobin?: RoundRobin;
};

export type ConsecutiveAvailabilityQuery = AvailabilityQuery & {
  emails?: Array<string[]>;
};

export type OpenHoursProperties = {
  emails: string[];
  days: Days[];
  timezone: string;
  start: string;
  end: string;
};

export class OpenHours extends Model implements OpenHoursProperties {
  objectType = 'open_hours';
  emails: string[] = [];
  days: Days[] = [];
  timezone = '';
  start = '';
  end = '';
  static attributes: Record<string, Attribute> = {
    objectType: Attributes.String({
      modelKey: 'objectType',
      jsonKey: 'object_type',
    }),
    emails: Attributes.StringList({
      modelKey: 'emails',
    }),
    days: Attributes.NumberList({
      modelKey: 'days',
    }),
    timezone: Attributes.String({
      modelKey: 'timezone',
    }),
    start: Attributes.String({
      modelKey: 'start',
    }),
    end: Attributes.String({
      modelKey: 'end',
    }),
  };

  constructor(props?: OpenHoursProperties) {
    super();
    this.initAttributes(props);
  }
}

export type CalendarConsecutiveAvailabilityProperties = {
  emails: string[];
  startTime: number;
  endTime: number;
};

export class CalendarConsecutiveAvailability extends Model
  implements CalendarConsecutiveAvailabilityProperties {
  emails: string[] = [];
  startTime = 0;
  endTime = 0;
  static attributes: Record<string, Attribute> = {
    emails: Attributes.StringList({
      modelKey: 'emails',
    }),
    startTime: Attributes.Number({
      modelKey: 'startTime',
      jsonKey: 'start_time',
    }),
    endTime: Attributes.Number({
      modelKey: 'endTime',
      jsonKey: 'end_time',
    }),
  };

  constructor(props?: CalendarConsecutiveAvailabilityProperties) {
    super();
    this.initAttributes(props);
  }
}

export type CalendarAvailabilityProperties = {
  timeSlots: TimeSlotProperties[];
  order?: string[];
};

export default class CalendarAvailability extends Model
  implements CalendarAvailabilityProperties {
  object = 'availability';
  timeSlots: TimeSlot[] = [];
  order?: string[];
  static attributes: Record<string, Attribute> = {
    timeSlots: Attributes.Collection({
      modelKey: 'timeSlots',
      jsonKey: 'time_slots',
      itemClass: TimeSlot,
    }),
    order: Attributes.StringList({
      modelKey: 'order',
    }),
  };

  constructor(props?: CalendarAvailabilityProperties) {
    super();
    this.initAttributes(props);
  }
}
