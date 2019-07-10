import RestfulModel from './restful-model';
import Attributes from './attributes';

export class Folder extends RestfulModel {
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
Folder.collectionName = 'folders';
Folder.attributes = {
  ...RestfulModel.attributes,
  name: Attributes.String({
    modelKey: 'name',
    jsonKey: 'name',
  }),
  displayName: Attributes.String({
    modelKey: 'displayName',
    jsonKey: 'display_name',
  }),
};

export class Label extends Folder {
  saveRequestBody() {
    return { display_name: this.displayName };
  }

  deleteRequestBody(params) {
    var body = {};
    if (params.hasOwnProperty('display_name')) {
      body.display_name = params.display_name;
    } else if (params.hasOwnProperty('displayName')) {
      body.display_name = params.displayName;
    } else {
      body.display_name = this.displayName;
    }
    return body;
  }
}
Label.collectionName = 'labels';
