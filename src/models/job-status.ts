import RestfulModel from './restful-model';
import Attributes from './attributes';
import NylasConnection from '../nylas-connection';
import Message from './message';

export type JobStatusProperties = {
  action?: string;
  createdAt?: Date;
  jobStatusId?: string;
  status?: string;
  originalData?: Message;
};

export default class JobStatus extends RestfulModel
  implements JobStatusProperties {
  action?: string;
  createdAt?: Date;
  jobStatusId?: string;
  status?: string;
  originalData?: Message;

  constructor(connection: NylasConnection, props?: JobStatusProperties) {
    super(connection, props);
    this.initAttributes(props);
  }

  // Returns the status of a job as a boolean
  isSuccessful(): boolean {
    return this.status === 'successful';
  }
}

JobStatus.collectionName = 'job-statuses';
JobStatus.attributes = {
  ...RestfulModel.attributes,
  action: Attributes.String({
    modelKey: 'action',
    readOnly: true,
  }),
  createdAt: Attributes.DateTime({
    modelKey: 'createdAt',
    jsonKey: 'created_at',
    readOnly: true,
  }),
  jobStatusId: Attributes.String({
    modelKey: 'jobStatusId',
    jsonKey: 'job_status_id',
    readOnly: true,
  }),
  status: Attributes.String({
    modelKey: 'status',
    readOnly: true,
  }),
  originalData: Attributes.Object({
    modelKey: 'originalData',
    jsonKey: 'original_data',
    readOnly: true,
  }),
};
