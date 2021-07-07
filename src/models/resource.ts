import RestfulModel from './restful-model';
import Attributes from './attributes';

export default class Resource extends RestfulModel {
  email?: string;
  name?: string;
  capacity?: string;
  building?: string;
  floorName?: string;
  floorNumber?: string;
}

Resource.collectionName = 'resources';
Resource.attributes = {
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
