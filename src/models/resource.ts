import RestfulModel from './restful-model';
import Attributes from './attributes';

export default class Resource extends RestfulModel {
  email?: string;
  name?: string;

  toJSON() {
    const json = super.toJSON();
    json['object'] = 'room_resource';
    return json;
  }
}

Resource.collectionName = 'resources';
Resource.attributes = {
  object: Attributes.String({
    modelKey: 'object',
  }),
  email: Attributes.String({
    modelKey: 'email',
  }),
  name: Attributes.String({
    modelKey: 'name',
  }),
};
