import RestfulModel, { SaveCallback } from './restful-model';
import Attributes from './attributes';

export class Folder extends RestfulModel {
  displayName?: string;
  name?: string;

  saveRequestBody() {
    const json: { [key: string]: any } = {};
    json['display_name'] = this.displayName;
    json['name'] = this.name;
    return json;
  }

  save(params: {} | SaveCallback = {}, callback?: SaveCallback) {
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
}
Label.collectionName = 'labels';
