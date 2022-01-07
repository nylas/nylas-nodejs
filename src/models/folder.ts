import RestfulModel, { SaveCallback } from './restful-model';
import Attributes from './attributes';
import NylasConnection from '../nylas-connection';

export type FolderProperties = {
  displayName?: string;
  name?: string;
};

export class Folder extends RestfulModel implements FolderProperties {
  displayName?: string;
  name?: string;
  jobStatusId?: string;

  constructor(connection: NylasConnection, props?: FolderProperties) {
    super(connection, props);
    this.initAttributes(props);
  }

  save(params: {} | SaveCallback = {}, callback?: SaveCallback): Promise<this> {
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
  jobStatusId: Attributes.String({
    modelKey: 'jobStatusId',
    jsonKey: 'job_status_id',
    readOnly: true,
  }),
};

export class Label extends Folder {
  constructor(connection: NylasConnection, props?: FolderProperties) {
    super(connection, props);
  }

  saveRequestBody(): Record<string, any> {
    return { display_name: this.displayName };
  }
}
Label.collectionName = 'labels';
