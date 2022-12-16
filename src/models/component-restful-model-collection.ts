import RestfulModelCollection from './restful-model-collection';
import NylasConnection from '../nylas-connection';
import Component, { ComponentProperties } from './component';

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

  create(
    props: ComponentProperties,
    callback?: (error: Error | null, result?: Component) => void
  ): Promise<Component> {
    return new Component(this.connection, props).save(callback);
  }

  path(): string {
    return `/component/${this.connection.clientId}`;
  }
}
