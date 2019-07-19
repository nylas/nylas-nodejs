import RestfulModel from './restful-model';
import NylasConnection from '../nylas-connection';

export default class ManagementModel extends RestfulModel {
  appId: string;
  constructor(connection: NylasConnection, appId: string, json: any) {
    super(connection, json);
    this.appId = appId;
  }
}
