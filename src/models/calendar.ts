import RestfulModel, { SaveCallback } from './restful-model';
import { GetCallback } from './model-collection';
import Attributes, { Attribute } from './attributes';
import NylasConnection from '../nylas-connection';
import JobStatus from './job-status';

export type CalendarProperties = {
  name: string;
  description: string;
  location: string;
  timezone: string;
  readOnly?: boolean;
  isPrimary?: boolean;
  jobStatusId?: string;
  metadata?: object;
  color?: number;
};

export default class Calendar extends RestfulModel
  implements CalendarProperties {
  name = '';
  description = '';
  location = '';
  timezone = '';
  readOnly?: boolean;
  isPrimary?: boolean;
  jobStatusId?: string;
  metadata?: object;
  color?: number;
  static collectionName = 'calendars';
  static attributes: Record<string, Attribute> = {
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
      readOnly: true,
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
      readOnly: true,
    }),
    jobStatusId: Attributes.String({
      modelKey: 'jobStatusId',
      jsonKey: 'job_status_id',
      readOnly: true,
    }),
    metadata: Attributes.Object({
      modelKey: 'metadata',
    }),
    color: Attributes.Number({
      modelKey: 'color',
      readOnly: true,
    }),
  };

  constructor(connection: NylasConnection, props?: CalendarProperties) {
    super(connection, props);
    this.initAttributes(props);
  }

  save(params: {} | SaveCallback = {}, callback?: SaveCallback): Promise<this> {
    return super.save(params, callback);
  }

  saveRequestBody(): Record<string, unknown> {
    const calendarJSON = super.saveRequestBody();
    return {
      name: calendarJSON.name,
      description: calendarJSON.description,
      location: calendarJSON.location,
      timezone: calendarJSON.timezone,
      metadata: calendarJSON.metadata,
    };
  }

  getJobStatus(callback?: GetCallback): Promise<JobStatus> {
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
