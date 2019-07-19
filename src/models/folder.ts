import RestfulModel, { SaveCallback } from './restful-model';
import Attributes from './attributes';

export class Label extends RestfulModel {
  displayName?: string;
  name?: string;

  protected saveRequestBody() {
    const json: { [key: string]: any } = {};
    json['display_name'] = this.displayName;
    json['name'] = this.name;
    return json;
  }

  save(params: SaveCallback | {}, callback?: SaveCallback) {
    return this._save(params, callback);
  }
}
Label.collectionName = 'labels';
Label.attributes = {
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

export class Folder extends Label {}
Folder.collectionName = 'folders';
