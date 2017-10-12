const RestfulModel = require('./restful-model');
const Attributes = require('./attributes');
const _ = require('underscore');

export class Contact extends RestfulModel {
  constructor() {
    super();
    this.collectionName = 'contacts';

    this.attributes = _.extend({}, RestfulModel.attributes, {
      name: Attributes.String({
        modelKey: 'name',
      }),

      email: Attributes.String({
        modelKey: 'email',
      }),
    });
  }

  toJSON() {
    const json = super.toJSON(...arguments);
    if (!json['name']) {
      json['name'] = json['email'];
    }
    return json;
  }
}
