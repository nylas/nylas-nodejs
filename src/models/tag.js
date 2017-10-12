const RestfulModel = require('./restful-model');
const Attributes = require('./attributes');
const _ = require('underscore');

export class Tag extends RestfulModel {
  constructor() {
    super();
    this.collectionName = 'tags';

    this.attributes = _.extend({}, RestfulModel.attributes, {
      name: Attributes.String({
        modelKey: 'name',
      }),
    });
  }
}
