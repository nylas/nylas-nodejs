import RestfulModel from './restful-model';
import Attributes, { Attribute } from './attributes';
import NylasConnection from '../nylas-connection';

export type ResourceProperties = {
  email: string;
  name: string;
  capacity: string;
  building: string;
  floorNumber: string;
  floorName?: string;
};

export default class Resource extends RestfulModel {
  email = '';
  name = '';
  capacity = '';
  building = '';
  floorNumber = '';
  floorName?: string;
  static collectionName = 'resources';
  static attributes: Record<string, Attribute> = {
    object: Attributes.String({
      modelKey: 'object',
      readOnly: true,
    }),
    email: Attributes.String({
      modelKey: 'email',
    }),
    name: Attributes.String({
      modelKey: 'name',
    }),
    capacity: Attributes.String({
      modelKey: 'capacity',
      readOnly: true,
    }),
    building: Attributes.String({
      modelKey: 'building',
      readOnly: true,
    }),
    floorName: Attributes.String({
      modelKey: 'floorName',
      jsonKey: 'floor_name',
      readOnly: true,
    }),
    floorNumber: Attributes.String({
      modelKey: 'floorNumber',
      jsonKey: 'floor_number',
      readOnly: true,
    }),
  };

  constructor(connection: NylasConnection, props?: ResourceProperties) {
    super(connection, props);
    this.initAttributes(props);
  }
}
