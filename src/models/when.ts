import Model from './model';
import Attributes, { Attribute } from './attributes';

export type WhenProperties = {
  startTime?: number;
  endTime?: number;
  startTimezone?: string;
  endTimezone?: string;
  time?: number;
  timezone?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  object?: string;
};

export default class When extends Model implements WhenProperties {
  startTime?: number;
  endTime?: number;
  startTimezone?: string;
  endTimezone?: string;
  time?: number;
  timezone?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  object?: string;
  static attributes: Record<string, Attribute> = {
    startTime: Attributes.Number({
      modelKey: 'startTime',
      jsonKey: 'start_time',
    }),
    endTime: Attributes.Number({
      modelKey: 'endTime',
      jsonKey: 'end_time',
    }),
    startTimezone: Attributes.String({
      modelKey: 'startTimezone',
      jsonKey: 'start_timezone',
    }),
    endTimezone: Attributes.String({
      modelKey: 'endTimezone',
      jsonKey: 'end_timezone',
    }),
    time: Attributes.Number({
      modelKey: 'time',
    }),
    timezone: Attributes.String({
      modelKey: 'timezone',
    }),
    startDate: Attributes.String({
      modelKey: 'startDate',
      jsonKey: 'start_date',
    }),
    endDate: Attributes.String({
      modelKey: 'endDate',
      jsonKey: 'end_date',
    }),
    date: Attributes.String({
      modelKey: 'date',
    }),
    object: Attributes.String({
      modelKey: 'object',
      readOnly: true,
    }),
  };

  constructor(props?: WhenProperties) {
    super();
    this.initAttributes(props);
  }

  // Helper method to check if the When object is actually set properly or not
  isSet(): boolean {
    return (
      (this.startTime != undefined && this.endTime != undefined) ||
      this.time != undefined ||
      (this.startDate != undefined && this.endDate != undefined) ||
      this.date != undefined
    );
  }
}
