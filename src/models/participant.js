const RestfulModel = require('./restful-model');
const Attributes = require('./attributes');
const _ = require('underscore');

export class Participant extends RestfulModel {
  constructor() {
    super();
    this.collectionName = 'participants';

    this.attributes = {
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
  }

  toJSON() {
    const json = super.toJSON(...arguments);
    if (!json['name']) {
      json['name'] = json['email'];
    }
    delete json['object'];
    return json;
  }
}
