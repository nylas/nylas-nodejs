import RestfulModel, { SaveCallback } from './restful-model';
import Attributes from './attributes';
import NylasConnection from '../nylas-connection';

export interface FolderProperties {
  displayName?: string;
  name?: string;
}

export class Folder extends RestfulModel implements FolderProperties {
  displayName?: string;
  name?: string;

  constructor(connection: NylasConnection, props?: FolderProperties) {
    super(connection, props);
    this.initAttributes(props);
  }

  saveRequestBody() {
    const json: { [key: string]: any } = {};
    json['display_name'] = this.displayName;
    json['name'] = this.name;
    return json;
  }

  protected save(params: {} | SaveCallback = {}, callback?: SaveCallback) {
    return super.save(params, callback);
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
  constructor(connection: NylasConnection, props?: FolderProperties) {
    super(connection, props);
  }

  saveRequestBody() {
    return { display_name: this.displayName };
  }
}
Label.collectionName = 'labels';
