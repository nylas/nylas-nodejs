import RestfulModelCollection from './restful-model-collection';

export default class ManagementModelCollection extends RestfulModelCollection {
  constructor(modelClass, connection, clientId) {
    super(modelClass, connection);
    this.clientId = clientId;
  }

  path() {
    return `/a/${this.clientId}/${this.modelClass.collectionName}`;
  }

  _createModel(json) {
    return new this.modelClass(this.connection, this.clientId, json);
  }
}
