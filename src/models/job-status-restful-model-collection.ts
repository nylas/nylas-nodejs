import RestfulModelCollection from './restful-model-collection';
import JobStatus from './job-status';
import NylasConnection from '../nylas-connection';
import OutboxJobStatus from './outbox-job-status';

export default class JobStatusRestfulModelCollection extends RestfulModelCollection<
  JobStatus
> {
  connection: NylasConnection;
  modelClass: typeof JobStatus;

  constructor(connection: NylasConnection) {
    super(JobStatus, connection);
    this.connection = connection;
    this.modelClass = JobStatus;
  }

  protected createModel(json: Record<string, unknown>): JobStatus {
    if (json['object'] && json['object'] === 'message') {
      return new OutboxJobStatus(this.connection).fromJSON(json);
    }

    return new this.modelClass(this.connection).fromJSON(json);
  }
}
