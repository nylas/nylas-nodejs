import OutboxMessage, { OutboxMessageProperties } from './outbox-message';
import Model from './model';
import Attributes, { Attribute } from './attributes';
import NylasConnection from '../nylas-connection';

export type OutboxJobStatusProperties = {
  jobStatusId: string;
  accountId: string;
  status: string;
  originalData?: OutboxMessageProperties;
};

export default class OutboxJobStatus extends Model
  implements OutboxJobStatusProperties {
  jobStatusId = '';
  status = '';
  accountId = '';
  originalData?: OutboxMessage;
  private _connection?: NylasConnection;
  static attributes: Record<string, Attribute> = {
    jobStatusId: Attributes.String({
      modelKey: 'jobStatusId',
      jsonKey: 'job_status_id',
      readOnly: true,
    }),
    status: Attributes.String({
      modelKey: 'status',
      readOnly: true,
    }),
    accountId: Attributes.String({
      modelKey: 'accountId',
      jsonKey: 'account_id',
      readOnly: true,
    }),
    originalData: Attributes.Object({
      modelKey: 'originalData',
      jsonKey: 'original_data',
      itemClass: OutboxMessage,
      readOnly: true,
    }),
  };

  constructor(props?: OutboxJobStatusProperties) {
    super();
    this.initAttributes(props);
  }

  get connection(): NylasConnection | undefined {
    return this._connection;
  }

  fromJSON(json: Record<string, unknown>, connection?: NylasConnection): this {
    // Allow a connection object to be passed in to instantiate a Calendar sub object
    if (connection) {
      this._connection = connection;
    }
    return super.fromJSON(json);
  }
}
