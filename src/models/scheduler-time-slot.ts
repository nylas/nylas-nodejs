import Attributes from './attributes';
import Model from './model';

export type SchedulerTimeSlotProperties = {
  accountId?: string;
  calendarId?: string;
  hostName?: string;
  emails?: string[];
  start?: Date;
  end?: Date;
};

export default class SchedulerTimeSlot extends Model
  implements SchedulerTimeSlotProperties {
  accountId?: string;
  calendarId?: string;
  hostName?: string;
  emails?: string[];
  start?: Date;
  end?: Date;

  constructor(props?: SchedulerTimeSlotProperties) {
    super();
    this.initAttributes(props);
  }
}
SchedulerTimeSlot.attributes = {
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
  start: Attributes.DateTime({
    modelKey: 'start',
  }),
  end: Attributes.DateTime({
    modelKey: 'end',
  }),
};
