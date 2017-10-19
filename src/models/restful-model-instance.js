import Promise from 'bluebird';

export default class RestfulModelInstance {
  constructor(modelClass, connection) {
    this.modelClass = modelClass;
    this.connection = connection;
    if (!(this.connection instanceof require('../nylas-connection'))) {
      throw new Error('Connection object not provided');
    }
    if (!this.modelClass) {
      throw new Error('Model class not provided');
    }
  }

  path() {
    return `/${this.modelClass.endpointName}`;
  }

  get(params) {
    if (!params) {
      params = {};
    }
    return this.connection
      .request({
        method: 'GET',
        path: this.path(),
        qs: params,
      })
      .then(json => {
        const model = new this.modelClass(this.connection, json);
        return Promise.resolve(model);
      });
  }
}
