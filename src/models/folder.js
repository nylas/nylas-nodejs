const RestfulModel = require('./restful-model');
const Attributes = require('./attributes');
const Promise = require('bluebird');
const _ = require('underscore');

export class Label extends RestfulModel {
  constructor() {
    super();
    this.collectionName = 'labels';

    this.attributes = _.extend({}, RestfulModel.attributes, {
      displayName: Attributes.String({
        modelKey: 'displayName',
        jsonKey: 'display_name',
      }),

      name: Attributes.String({
        modelKey: 'name',
        jsonKey: 'name',
      }),
    });
  }

  saveRequestBody() {
    const json = {};
    json['display_name'] = this.displayName;
    json['name'] = this.name;
    return json;
  }

  save(params, callback = null) {
    if (!params) {
      params = {};
    }
    return this._save(params, callback);
  }
}

export class Folder extends Label {
  constructor() {
    super();
    this.collectionName = 'folders';
  }
}
