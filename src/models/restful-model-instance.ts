import RestfulModel from "./restful-model";
import NylasConnection from "../nylas-connection";

export default class RestfulModelInstance<T extends RestfulModel> {
  modelClass: typeof RestfulModel;
  connection: NylasConnection;
  
  constructor(modelClass: typeof RestfulModel, connection: NylasConnection) {
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

  get(params: { [key: string]: any} = {}) {
    return this.connection
      .request({
        method: 'GET',
        path: this.path(),
        qs: params,
      })
      .then((json: any) => {
        const model = new this.modelClass(this.connection, json) as T;
        return Promise.resolve(model);
      });
  }
}
