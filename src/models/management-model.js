import RestfulModel from './restful-model';

export default class ManagementModel extends RestfulModel {
  constructor(connection, clientId, json = null) {
    super(connection, json);
    this.clientId = clientId;
  }
}
