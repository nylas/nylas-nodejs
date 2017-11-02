import _ from 'underscore';

import Message from './message';
import RestfulModel from './restful-model';
import Contact from './contact';
import * as Attributes from './attributes';
import { Label, Folder } from './folder';

export default class Thread extends RestfulModel {
  constructor(...args) {
    super(...args);
    this.fromJSON = this.fromJSON.bind(this);
    this.save = this.save.bind(this);
  }

  fromJSON(json) {
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

  save(params = {}, callback = null) {
    return this._save(params, callback);
  }
}
Thread.collectionName = 'threads';
Thread.attributes = _.extend({}, RestfulModel.attributes, {
  snippet: Attributes.String({
    modelKey: 'snippet',
  }),
  subject: Attributes.String({
    modelKey: 'subject',
  }),
  unread: Attributes.Boolean({
    modelKey: 'unread',
  }),
  starred: Attributes.Boolean({
    modelKey: 'starred',
  }),
  messageIds: Attributes.StringList({
    modelKey: 'messageIds',
    jsonKey: 'message_ids',
  }),
  version: Attributes.String({
    modelKey: 'version',
    jsonKey: 'version',
  }),
  participants: Attributes.Collection({
    modelKey: 'participants',
    itemClass: Contact,
  }),
  lastMessageTimestamp: Attributes.DateTime({
    modelKey: 'lastMessageTimestamp',
    jsonKey: 'last_message_timestamp',
  }),
  firstMessageTimestamp: Attributes.DateTime({
    modelKey: 'firstMessageTimestamp',
    jsonKey: 'first_message_timestamp',
  }),
  lastMessageReceivedTimestamp: Attributes.DateTime({
    modelKey: 'lastMessageReceivedTimestamp',
    jsonKey: 'last_message_received_timestamp',
  }),
  lastMessageSentTimestamp: Attributes.DateTime({
    modelKey: 'lastMessageSentTimestamp',
    jsonKey: 'last_message_sent_timestamp',
  }),
  hasAttachments: Attributes.Boolean({
    modelKey: 'has_attachments',
  }),
  labels: Attributes.Collection({
    modelKey: 'labels',
    itemClass: Label,
    jsonKey: 'labels',
  }),
  folder: Attributes.Object({
    modelKey: 'folder',
    itemClass: Folder,
    jsonKey: 'folders',
  }),
  messages: Attributes.Collection({
    modelKey: 'messages',
    itemClass: Message,
  }),
  drafts: Attributes.Collection({
    modelKey: 'drafts',
    itemClass: Message,
  }),
});
