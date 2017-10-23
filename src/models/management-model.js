import RestfulModel from './restful-model';

export default class ManagementModel extends RestfulModel {
  constructor(connection, appId, json = null) {
    super(connection, json);
    this.appId = appId;
  }
}
