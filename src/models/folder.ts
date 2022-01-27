import RestfulModel, { SaveCallback } from './restful-model';
import Attributes, { Attribute } from './attributes';
import NylasConnection from '../nylas-connection';

export type FolderProperties = {
  displayName?: string;
  name?: string;
};

export default class Folder extends RestfulModel implements FolderProperties {
  displayName?: string;
  name?: string;
  jobStatusId?: string;
  static collectionName = 'folders';
  static attributes: Record<string, Attribute> = {
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

  constructor(connection: NylasConnection, props?: FolderProperties) {
    super(connection, props);
    this.initAttributes(props);
  }

  save(params: {} | SaveCallback = {}, callback?: SaveCallback): Promise<this> {
    return super.save(params, callback);
  }
}

export class Label extends Folder {
  static collectionName = 'labels';
  constructor(connection: NylasConnection, props?: FolderProperties) {
    super(connection, props);
  }

  saveRequestBody(): Record<string, any> {
    return { display_name: this.displayName };
  }
}
