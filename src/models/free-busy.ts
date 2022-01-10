import Model from './model';
import Attributes from './attributes';

export type FreeBusyQuery = {
  startTime: number;
  endTime: number;
  emails: string[];
}

export type TimeSlotProperties = {
  status: string;
  startTime: number;
  endTime: number;
};

export class TimeSlot extends Model implements TimeSlotProperties {
  object = 'time_slot';
  status = '';
  startTime = 0;
  endTime = 0;

  constructor(props?: TimeSlotProperties) {
    super();
    this.initAttributes(props);
  }
}
TimeSlot.attributes = {
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
};

export type FreeBusyProperties = {
  email: string;
  timeSlots: TimeSlotProperties[];
};

export default class FreeBusy extends Model implements FreeBusyProperties {
  object = 'free_busy';
  email = '';
  timeSlots: TimeSlot[] = [];

  constructor(props?: FreeBusyProperties) {
    super();
    this.initAttributes(props);
  }
}
FreeBusy.attributes = {
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
