import Model from './model';
import Attributes from './attributes';

type WhenProperties = {
  startTime?: number;
  endTime?: number;
  time?: number;
  startDate?: string;
  endDate?: string;
  date?: string;
  object?: string;
}

export default class When extends Model {
  startTime?: number;
  endTime?: number;
  time?: number;
  startDate?: string;
  endDate?: string;
  date?: string;
  object?: string;

  constructor(props?: WhenProperties) {
    super();
    if(props) {
      this.startTime = props.startTime;
      this.endTime = props.endTime;
      this.time = props.time;
      this.startDate = props.startDate;
      this.endDate = props.endDate;
      this.date = props.date;
      this.object = props.object;
    }
  }

  toJSON(): any {
    return super.toJSON();
  }
}

When.attributes = {
  startTime: Attributes.Number({
    modelKey: 'startTime',
    jsonKey: 'start_time',
  }),
  endTime: Attributes.Number({
    modelKey: 'endTime',
    jsonKey: 'end_time',
  }),
  time: Attributes.Number({
    modelKey: 'time',
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
  }),
};