const RestfulModel = require('./restful-model');
const Attributes = require('./attributes');
const _ = require('underscore');

export class Calendar extends RestfulModel {
  constructor() {
    super();
    this.collectionName = 'calendars';

    this.attributes = _.extend({}, RestfulModel.attributes, {
      name: Attributes.String({
        modelKey: 'name',
      }),
      description: Attributes.String({
        modelKey: 'description',
      }),
      readOnly: Attributes.Boolean({
        modelKey: 'readOnly',
        jsonKey: 'read_only',
      }),
    });
  }
}
