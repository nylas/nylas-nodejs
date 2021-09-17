import RestfulModel from './restful-model';
import Attributes from './attributes';
import NylasConnection from '../nylas-connection';

export type JobStatusProperties = {
  action?: string;
  createdAt?: Date;
  jobStatusId?: string;
  status?: string;
};

export default class JobStatus extends RestfulModel
  implements JobStatusProperties {
  action?: string;
  createdAt?: Date;
  jobStatusId?: string;
  status?: string;

  constructor(connection: NylasConnection, props?: JobStatusProperties) {
    super(connection, props);
    this.initAttributes(props);
  }
}

JobStatus.collectionName = 'job-statuses';
JobStatus.attributes = {
  ...RestfulModel.attributes,
  action: Attributes.String({
    modelKey: 'action',
  }),
  createdAt: Attributes.DateTime({
    modelKey: 'createdAt',
    jsonKey: 'created_at',
  }),
  jobStatusId: Attributes.String({
    modelKey: 'jobStatusId',
    jsonKey: 'job_status_id',
  }),
  status: Attributes.String({
    modelKey: 'status',
  }),
};
