import RestfulModelCollection from './restful-model-collection';
import JobStatus from './job-status';
import NylasConnection from '../nylas-connection';
import OutboxJobStatus from './outbox-job-status';
import { RestfulQuery } from './model-collection';

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

  list(
    params: RestfulQuery,
    callback?: (error: Error | null, obj?: JobStatus[]) => void
  ): Promise<JobStatus[]> {
    return super.list(params, callback);
  }

  protected createModel(json: Record<string, unknown>): JobStatus {
    if (json['object'] && json['object'] === 'message') {
      return new OutboxJobStatus(this.connection).fromJSON(json);
    }

    return new this.modelClass(this.connection).fromJSON(json);
  }
}
