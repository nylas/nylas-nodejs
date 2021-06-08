import NylasConnection from '../nylas-connection';
import RestfulModel from './restful-model';

export default class RestfulModelInstance<T extends RestfulModel> {
  connection: NylasConnection;
  modelClass: typeof RestfulModel;

  constructor(modelClass: typeof RestfulModel, connection: NylasConnection) {
    this.modelClass = modelClass;
    this.connection = connection;
    if (!(this.connection instanceof NylasConnection)) {
      throw new Error('Connection object not provided');
    }
    if (!this.modelClass) {
      throw new Error('Model class not provided');
    }
  }

  path() {
    return `/${this.modelClass.endpointName}`;
  }

  get(params: { [key: string]: any } = {}): Promise<T> {
    return this.connection
      .request({
        method: 'GET',
        path: this.path(),
        qs: params,
      })
      .then(json => {
        const model = new this.modelClass(this.connection, json) as T;
        return Promise.resolve(model);
      });
  }
}
