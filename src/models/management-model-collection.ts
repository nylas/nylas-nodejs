import RestfulModelCollection from './restful-model-collection';
import RestfulModel from './restful-model';
import NylasConnection from '../nylas-connection';
import ManagementModel from './management-model';

export default class ManagementModelCollection<T extends ManagementModel> extends RestfulModelCollection<T> {
  appId: string;
  
  constructor(modelClass: typeof ManagementModel, connection: NylasConnection, appId: string) {
    super(modelClass as any, connection);
    this.appId = appId;
  }

  path() {
    return `/a/${this.appId}/${this.modelClass.collectionName}`;
  }

  _createModel(json: {[key: string]: any}) {
    return new (this.modelClass as any)(this.connection, this.appId, json);
  }
}
