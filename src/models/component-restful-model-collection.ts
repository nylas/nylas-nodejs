import RestfulModelCollection from './restful-model-collection';
import NylasConnection from '../nylas-connection';
import Component from './component';

export default class ComponentRestfulModelCollection extends RestfulModelCollection<
  Component
> {
  connection: NylasConnection;
  modelClass: typeof Component;

  constructor(connection: NylasConnection) {
    super(Component, connection);
    this.connection = connection;
    this.modelClass = Component;
  }

  path(): string {
    return `/component/${this.connection.clientId}`;
  }
}
