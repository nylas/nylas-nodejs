import _ from 'underscore';

import RestfulModel from './restful-model';
import Attributes from './attributes';

export default class Participant extends RestfulModel {
  toJSON() {
    const json = super.toJSON(...arguments);
    if (!json['name']) {
      json['name'] = json['email'];
    }
    delete json['object'];
    return json;
  }
}
Participant.collectionName = 'participants';
Participant.attributes = {
  name: Attributes.String({
    modelKey: 'name',
  }),
  email: Attributes.String({
    modelKey: 'email',
  }),
  status: Attributes.String({
    modelKey: 'status',
  }),
};
