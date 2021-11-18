import RestfulModel from './restful-model';
import Attributes from './attributes';

export default class SchedulerTimeSlot extends RestfulModel {
  accountId?: string;
  calendarId?: string;
  hostName?: string;
  emails?: string[];
  start?: Date;
  end?: Date;
}
SchedulerTimeSlot.collectionName = 'scheduler_slot';
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
