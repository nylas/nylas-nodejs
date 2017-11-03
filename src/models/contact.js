import _ from 'underscore';

import RestfulModel from './restful-model';
import Attributes from './attributes';

export default class Contact extends RestfulModel {
  toJSON() {
    const json = super.toJSON(...arguments);
    if (!json['name']) {
      json['name'] = json['email'];
    }
    return json;
  }
}
Contact.collectionName = 'contacts';
Contact.attributes = _.extend({}, RestfulModel.attributes, {
  name: Attributes.String({
    modelKey: 'name',
  }),
  email: Attributes.String({
    modelKey: 'email',
  }),
});
