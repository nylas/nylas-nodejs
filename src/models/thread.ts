import Message from './message';
import RestfulModel from './restful-model';
import * as Attributes from './attributes';
import EmailParticipant from './email-participant';
import { Label, Folder } from './folder';

export default class Thread extends RestfulModel {
  subject?: string;
  participants?: EmailParticipant[];
  lastMessageTimestamp?: Date;
  lastMessageReceivedTimestamp?: Date;
  lastMessageSentTimestamp?: Date;
  firstMessageTimestamp?: Date;
  snippet?: string;
  unread?: boolean;
  starred?: boolean;
  hasAttachments?: boolean;
  version?: string;
  folders?: Folder[];
  labels?: Label[];
  messageIds?: string[];
  draftIds?: string[];
  messages?: Message[];
  drafts?: Message[];

  constructor(...args) {
    super(...args);
    this.fromJSON = this.fromJSON.bind(this);
  }

  fromJSON(json: { [key: string]: any }) {
    super.fromJSON(json);
    return this;
  }

  saveRequestBody() {
    const json = {};
    if (this.labels) {
      json['label_ids'] = this.labels.map(label => label.id);
    } else if (this.folder) {
      json['folder_id'] = this.folder.id;
    }

    json['starred'] = this.starred;
    json['unread'] = this.unread;
    return json;
  }

  save(params: { [key: string]: any } = {}, callback: () => void = null) {
    return this._save(params, callback);
  }

  get folder() {
    process.emitWarning(
      '"thread.folder" will be deprecated in version 5.0.0. Use "thread.folders" instead.',
      {
        code: 'Nylas',
        type: 'DeprecationWarning',
      }
    );
    return this.folders;
  }

  set folder(value: Folders[]) {
    this.folders = value;
    process.emitWarning(
      '"thread.folder" will be deprecated in version 5.0.0. Use "thread.folders" instead.',
      {
        code: 'Nylas',
        type: 'DeprecationWarning',
      }
    );
  }
}
Thread.collectionName = 'threads';
Thread.attributes = {
  ...RestfulModel.attributes,
  subject: Attributes.String({
    modelKey: 'subject',
  }),
  participants: Attributes.Collection({
    modelKey: 'participants',
    itemClass: EmailParticipant,
  }),
  lastMessageTimestamp: Attributes.DateTime({
    modelKey: 'lastMessageTimestamp',
    jsonKey: 'last_message_timestamp',
  }),
  lastMessageReceivedTimestamp: Attributes.DateTime({
    modelKey: 'lastMessageReceivedTimestamp',
    jsonKey: 'last_message_received_timestamp',
  }),
  lastMessageSentTimestamp: Attributes.DateTime({
    modelKey: 'lastMessageSentTimestamp',
    jsonKey: 'last_message_sent_timestamp',
  }),
  firstMessageTimestamp: Attributes.DateTime({
    modelKey: 'firstMessageTimestamp',
    jsonKey: 'first_message_timestamp',
  }),
  snippet: Attributes.String({
    modelKey: 'snippet',
  }),
  unread: Attributes.Boolean({
    modelKey: 'unread',
  }),
  starred: Attributes.Boolean({
    modelKey: 'starred',
  }),
  hasAttachments: Attributes.Boolean({
    modelKey: 'has_attachments',
  }),
  version: Attributes.String({
    modelKey: 'version',
    jsonKey: 'version',
  }),
  folders: Attributes.Collection({
    modelKey: 'folders',
    itemClass: Folder,
    jsonKey: 'folders',
  }),
  labels: Attributes.Collection({
    modelKey: 'labels',
    itemClass: Label,
    jsonKey: 'labels',
  }),
  messageIds: Attributes.StringList({
    modelKey: 'messageIds',
    jsonKey: 'message_ids',
  }),
  draftIds: Attributes.StringList({
    modelKey: 'draftIds',
    jsonKey: 'draft_ids',
  }),
  messages: Attributes.Collection({
    modelKey: 'messages',
    itemClass: Message,
  }),
  drafts: Attributes.Collection({
    modelKey: 'drafts',
    itemClass: Message,
  }),
};
