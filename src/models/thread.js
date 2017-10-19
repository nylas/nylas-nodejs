import _ from 'underscore';

import Tag from './tag';
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
    this.tagIds = this.tagIds.bind(this);
  }

  fromJSON(json) {
    super.fromJSON(json);
    this.unread = this.isUnread();
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

  save(params, callback = null) {
    if (!params) {
      params = {};
    }
    return this._save(params, callback);
  }

  tagIds() {
    return _.map(this.tags, tag => tag.id);
  }

  isUnread() {
    return this.tagIds().indexOf('unread') !== -1;
  }

  isStarred() {
    return this.tagIds().indexOf('starred') !== -1;
  }

  markAsRead() {}

  star() {
    return this.addRemoveTags(['starred'], []);
  }

  unstar() {
    return this.addRemoveTags([], ['starred']);
  }

  toggleStar() {
    if (this.isStarred()) {
      return this.unstar();
    } else {
      return this.star();
    }
  }

  archive() {
    return this.addRemoveTags(['archive'], ['inbox']);
  }

  unarchive() {
    return this.addRemoveTags(['inbox'], ['archive']);
  }

  addRemoveTags(tagIdsToAdd, tagIdsToRemove) {}
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
    queryable: true,
    modelKey: 'unread',
  }),
  starred: Attributes.Boolean({
    queryable: true,
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
  tags: Attributes.Collection({
    queryable: true,
    modelKey: 'tags',
    itemClass: Tag,
  }),
  participants: Attributes.Collection({
    modelKey: 'participants',
    itemClass: Contact,
  }),
  lastMessageTimestamp: Attributes.DateTime({
    queryable: true,
    modelKey: 'lastMessageTimestamp',
    jsonKey: 'last_message_timestamp',
  }),
  firstMessageTimestamp: Attributes.DateTime({
    queryable: true,
    modelKey: 'firstMessageTimestamp',
    jsonKey: 'first_message_timestamp',
  }),
  lastMessageReceivedTimestamp: Attributes.DateTime({
    queryable: true,
    modelKey: 'lastMessageReceivedTimestamp',
    jsonKey: 'last_message_received_timestamp',
  }),
  lastMessageSentTimestamp: Attributes.DateTime({
    queryable: true,
    modelKey: 'lastMessageSentTimestamp',
    jsonKey: 'last_message_sent_timestamp',
  }),
  hasAttachments: Attributes.Boolean({
    queryable: true,
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
