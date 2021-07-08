import RestfulModel from './restful-model';
import Attributes from './attributes';

export default class JobStatus extends RestfulModel {
  action?: string;
  createdAt?: Date;
  jobStatusId?: string;
  status?: string;
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
