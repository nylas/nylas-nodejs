import RestfulModel from './restful-model';
import NylasConnection from '../nylas-connection';

export default class ManagementModel extends RestfulModel {
  clientId: string;

  constructor(
    connection: NylasConnection,
    clientId: string,
    props: Record<string, unknown>
  ) {
    super(connection, props);
    this.clientId = clientId;
  }
}
