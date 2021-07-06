import ManagementModel from './management-model';
import NylasConnection from '../nylas-connection';
import RestfulModelCollection from './restful-model-collection';

export default class ManagementModelCollection<
  T extends ManagementModel
> extends RestfulModelCollection<T> {
  clientId: string;

  constructor(
    modelClass: typeof ManagementModel,
    connection: NylasConnection,
    clientId: string
  ) {
    super(modelClass as any, connection);
    this.clientId = clientId;
  }

  path() {
    return `/a/${this.clientId}/${this.modelClass.collectionName}`;
  }

  _createModel(json: { [key: string]: any }) {
    return new (this.modelClass as any)(this.connection, this.clientId, json);
  }
}
