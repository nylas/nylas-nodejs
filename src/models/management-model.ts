import RestfulModel from './restful-model';

export default class ManagementModel extends RestfulModel {
  clientId?: string;

  constructor(connection, clientId, json?: { [key: string]: any } = null) {
    super(connection, json);
    this.clientId = clientId;
  }
}
