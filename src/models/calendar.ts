import RestfulModel, { SaveCallback } from './restful-model';
import { GetCallback } from './restful-model-collection';
import Attributes from './attributes';
import NylasConnection from '../nylas-connection';

export interface CalendarProperties {
  name: string;
  description: string;
  location: string;
  timezone: string;
  readOnly?: boolean;
  isPrimary?: boolean;
  jobStatusId?: string;
}

export default class Calendar extends RestfulModel
  implements CalendarProperties {
  name = '';
  description = '';
  location = '';
  timezone = '';
  readOnly?: boolean;
  isPrimary?: boolean;
  jobStatusId?: string;

  constructor(connection: NylasConnection, props?: CalendarProperties) {
    super(connection, props);
    this.initAttributes(props);
  }

  protected save(params: {} | SaveCallback = {}, callback?: SaveCallback) {
    return super.save(params, callback);
  }

  saveRequestBody() {
    const calendarJSON = super.saveRequestBody();
    return {
      name: calendarJSON.name,
      description: calendarJSON.description,
      location: calendarJSON.location,
      timezone: calendarJSON.timezone,
    };
  }

  getJobStatus(callback?: GetCallback) {
    if (typeof this.jobStatusId === 'undefined') {
      const err = new Error('jobStatusId must be defined');
      if (callback) {
        callback(err);
      }
      return Promise.reject(err);
    }
    return this.connection.jobStatuses.find(this.jobStatusId, callback);
  }
}

Calendar.collectionName = 'calendars';
Calendar.attributes = {
  ...RestfulModel.attributes,
  name: Attributes.String({
    modelKey: 'name',
  }),
  description: Attributes.String({
    modelKey: 'description',
  }),
  readOnly: Attributes.Boolean({
    modelKey: 'readOnly',
    jsonKey: 'read_only',
  }),
  location: Attributes.String({
    modelKey: 'location',
  }),
  timezone: Attributes.String({
    modelKey: 'timezone',
  }),
  isPrimary: Attributes.Boolean({
    modelKey: 'isPrimary',
    jsonKey: 'is_primary',
  }),
  jobStatusId: Attributes.String({
    modelKey: 'jobStatusId',
    jsonKey: 'job_status_id',
  }),
};
