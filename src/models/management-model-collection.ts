import ManagementModel from './management-model';
import NylasConnection from '../nylas-connection';
import RestfulModelCollection from './restful-model-collection';

export default class ManagementModelCollection<
  T extends ManagementModel
> extends RestfulModelCollection<T> {
  clientId: string;
  path: string;

  constructor(
    modelClass: typeof ManagementModel,
    connection: NylasConnection,
    clientId: string
  ) {
    super(modelClass as any, connection);
    this.clientId = clientId;
    this.path = `/a/${this.clientId}/${this.modelClass.collectionName}`;
  }

  build(args: { [key: string]: any }): T {
    return super._build(args);
  }

  _createModel(json: { [key: string]: any }) {
    const props = this.modelClass.propsFromJSON(json, this);
    return new (this.modelClass as any)(this.connection, this.clientId, props);
  }
}
