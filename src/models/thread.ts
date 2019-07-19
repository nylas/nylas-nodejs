import Message from './message';
import RestfulModel, { SaveCallback } from './restful-model';
import Contact from './contact';
import Attributes from './attributes';
import { Label, Folder } from './folder';

export default class Thread extends RestfulModel {
  subject?: string;
  participants?: Contact[];
  lastMessageTimestamp?: Date;
  lastMessageReceivedTimestamp?: Date;
  lastMessageSentTimestamp?: Date;
  firstMessageTimestamp?: Date;
  snippet?: string;
  unread?: boolean;
  starred?: boolean;
  hasAttachments?: boolean;
  version?: string;
  folder?: Folder;
  labels?: Label[];
  messageIds?: string[];
  draftIds?: string[];
  messages?: Message[];
  drafts?: Message[];

  fromJSON = (json: { [key: string]: any }) => {
    super.fromJSON(json);
    return this;
  };

  saveRequestBody() {
    const json: { [key: string]: any } = {};
    if (this.labels) {
      json['label_ids'] = this.labels.map(label => label.id);
    } else if (this.folder) {
      json['folder_id'] = this.folder.id;
    }

    json['starred'] = this.starred;
    json['unread'] = this.unread;
    return json;
  }

  save(params: SaveCallback | {}, callback?: SaveCallback) {
    return this._save(params, callback);
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
    itemClass: Contact,
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
  folder: Attributes.Object({
    modelKey: 'folder',
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
