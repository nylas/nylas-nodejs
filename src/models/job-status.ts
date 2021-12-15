import RestfulModel from './restful-model';
import Attributes from './attributes';
import Message from './message';

export default class JobStatus extends RestfulModel {
  action?: string;
  createdAt?: Date;
  jobStatusId?: string;
  status?: string;
  originalData?: Message;

  // Returns the status of a job as a boolean
  isSuccessful(): boolean {
    return this.status === "successful";
  }
}

JobStatus.collectionName = 'job-statuses';
JobStatus.attributes = {
  ...RestfulModel.attributes,
  action: Attributes.String({
    modelKey: 'action',
    readOnly: true
  }),
  createdAt: Attributes.DateTime({
    modelKey: 'createdAt',
    jsonKey: 'created_at',
    readOnly: true
  }),
  jobStatusId: Attributes.String({
    modelKey: 'jobStatusId',
    jsonKey: 'job_status_id',
    readOnly: true
  }),
  status: Attributes.String({
    modelKey: 'status',
    readOnly: true
  }),
  originalData: Attributes.Object({
    modelKey: 'originalData',
    jsonKey: 'original_data',
    readOnly: true
  }),
};
