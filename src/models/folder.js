import Promise from 'bluebird';
import _ from 'underscore';

import RestfulModel from './restful-model';
import Attributes from './attributes';

export class Label extends RestfulModel {
  saveRequestBody() {
    const json = {};
    json['display_name'] = this.displayName;
    json['name'] = this.name;
    return json;
  }

  save(params = {}, callback = null) {
    return this._save(params, callback);
  }
}
Label.collectionName = 'labels';
Label.attributes = _.extend({}, RestfulModel.attributes, {
  displayName: Attributes.String({
    modelKey: 'displayName',
    jsonKey: 'display_name',
  }),

  name: Attributes.String({
    modelKey: 'name',
    jsonKey: 'name',
  }),
});

export class Folder extends Label {}
Folder.collectionName = 'folders';
