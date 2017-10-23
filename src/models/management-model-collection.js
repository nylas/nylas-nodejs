import RestfulModelCollection from './restful-model-collection';

export default class ManagementModelCollection extends RestfulModelCollection {
  constructor(modelClass, connection, appId) {
    super(modelClass, connection);
    this.appId = appId;
  }

  path() {
    return `/a/${this.appId}/${this.modelClass.collectionName}`;
  }

  _createModel(json) {
    return new this.modelClass(this.connection, this.appId, json);
  }
}
