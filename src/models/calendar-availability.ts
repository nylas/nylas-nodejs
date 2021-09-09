import Model from './model';
import Attributes from './attributes';
import { TimeSlot, TimeSlotProperties } from './free-busy';

export interface OpenHoursProperties {
  emails: string[];
  days: string[];
  timezone: string;
  start: string;
  end: string;
}

export class OpenHours extends Model implements OpenHoursProperties {
  objectType = 'open_hours';
  emails = [];
  days = [];
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
    modelKey: 'emails'
  }),
  days: Attributes.StringList({
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
}

export interface CalendarAvailabilityProperties {
  timeSlots: TimeSlotProperties[];
}

export default class CalendarAvailability extends Model implements CalendarAvailabilityProperties {
  object = 'availability';
  timeSlots: TimeSlot[] = [];

  constructor(props?: CalendarAvailabilityProperties) {
    super();
    this.initAttributes(props);
  }
}