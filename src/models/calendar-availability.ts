import Model from './model';
import Attributes from './attributes';
import { FreeBusyProperties, TimeSlot, TimeSlotProperties } from './free-busy';

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
}

export type SingleAvailabilityQuery = AvailabilityQuery & {
  emails: string[];
  roundRobin?: RoundRobin;
}

export type ConsecutiveAvailabilityQuery = AvailabilityQuery & {
  emails: Array<string[]>;
}

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

  constructor(props?: OpenHoursProperties) {
    super();
    this.initAttributes(props);
  }
}
OpenHours.attributes = {
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

export type CalendarConsecutiveAvailabilityProperties = {
  emails: string[];
  start_time: number;
  end_time: number;
};

export class CalendarConsecutiveAvailability extends Model
  implements CalendarConsecutiveAvailabilityProperties {
  emails: string[] = [];
  start_time = 0;
  end_time = 0;

  constructor(props?: CalendarConsecutiveAvailabilityProperties) {
    super();
    this.initAttributes(props);
  }
}

export type CalendarAvailabilityProperties = {
  timeSlots: TimeSlotProperties[];
};

export default class CalendarAvailability extends Model
  implements CalendarAvailabilityProperties {
  object = 'availability';
  timeSlots: TimeSlot[] = [];

  constructor(props?: CalendarAvailabilityProperties) {
    super();
    this.initAttributes(props);
  }
}
