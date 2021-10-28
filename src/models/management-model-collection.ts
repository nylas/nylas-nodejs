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

  build(args: Record<string, unknown>): T {
    return super.build(args);
  }

  path(): string {
    return `/a/${this.clientId}/${this.modelClass.collectionName}`;
  }

  protected createModel(json: Record<string, unknown>): T {
    const props = this.modelClass.propsFromJSON(json, this);
    return new (this.modelClass as any)(this.connection, this.clientId, props);
  }
}
