import RestfulModelCollection from './restful-model-collection';

export default class ManagementModelCollection extends RestfulModelCollection {
  constructor(modelClass, connection, appId) {
    super(modelClass, connection);
    this.appId = appId;
  }

  path() {
    return `/a/${this.appId}/${this.modelClass.collectionName}`;
  }
}
