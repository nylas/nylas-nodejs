import RestfulModel, { SaveCallback } from './restful-model';
import Attributes from './attributes';
import File from './file';
import Event from './event';
import EmailParticipant from './email-participant';
import { Label, Folder } from './folder';

export default class Message extends RestfulModel {
  subject?: string;
  from?: EmailParticipant[];
  replyTo?: EmailParticipant[];
  to?: EmailParticipant[];
  cc?: EmailParticipant[];
  bcc?: EmailParticipant[];
  date?: Date;
  threadId?: string;
  snippet?: string;
  body?: string;
  unread?: boolean;
  starred?: boolean;
  files?: File[];
  events?: Event[];
  folder?: Folder;
  labels?: Label[];
  metadata?: object;
  headers?: { [key: string]: string };
  failures?: any;

  // We calculate the list of participants instead of grabbing it from
  // a parent because it is a better source of ground truth, and saves us
  // from more dependencies.
  participants() {
    const participants: { [key: string]: EmailParticipant } = {};
    const to = this.to || [];
    const cc = this.cc || [];
    const from = this.from || [];
    const contacts = Array.from(new Set([...to, ...cc, ...from]));
    for (const contact of contacts) {
      if (contact && (contact.email ? contact.email.length : '') > 0) {
        if (contact) {
          participants[
            `${contact.email || ''.toLowerCase().trim()} ${(contact.name || '')
              .toLowerCase()
              .trim()}`
          ] = contact;
        }
      }
    }
    return Object.values(participants);
  }

  fileIds() {
    return this.files ? this.files.map(file => file.id) : [];
  }

  getRaw() {
    return this.connection
      .request({
        method: 'GET',
        headers: {
          Accept: 'message/rfc822',
        },
        path: `/${Message.collectionName}/${this.id}`,
      })
      .catch(err => Promise.reject(err));
  }

  saveRequestBody() {
    // It's possible to update most of the fields of a draft.
    if (this.constructor.name === 'Draft') {
      return super.saveRequestBody();
    }

    // Messages are more limited, though.
    const json: { [key: string]: any } = {};
    if (this.labels) {
      json['label_ids'] = Array.from(this.labels).map(label => label.id);
    } else if (this.folder) {
      json['folder_id'] = this.folder.id;
    }

    json['starred'] = this.starred;
    json['unread'] = this.unread;
    json['metadata'] = this.metadata;
    return json;
  }

  save(params: {} | SaveCallback = {}, callback?: SaveCallback) {
    return this._save(params, callback);
  }
}
Message.collectionName = 'messages';
Message.attributes = {
  ...RestfulModel.attributes,
  subject: Attributes.String({
    modelKey: 'subject',
  }),
  from: Attributes.Collection({
    modelKey: 'from',
    itemClass: EmailParticipant,
  }),
  replyTo: Attributes.Collection({
    modelKey: 'replyTo',
    jsonKey: 'reply_to',
    itemClass: EmailParticipant,
  }),
  to: Attributes.Collection({
    modelKey: 'to',
    itemClass: EmailParticipant,
  }),
  cc: Attributes.Collection({
    modelKey: 'cc',
    itemClass: EmailParticipant,
  }),
  bcc: Attributes.Collection({
    modelKey: 'bcc',
    itemClass: EmailParticipant,
  }),
  date: Attributes.DateTime({
    modelKey: 'date',
  }),
  threadId: Attributes.String({
    modelKey: 'threadId',
    jsonKey: 'thread_id',
  }),
  snippet: Attributes.String({
    modelKey: 'snippet',
  }),
  body: Attributes.String({
    modelKey: 'body',
  }),
  unread: Attributes.Boolean({
    modelKey: 'unread',
  }),
  starred: Attributes.Boolean({
    modelKey: 'starred',
  }),
  files: Attributes.Collection({
    modelKey: 'files',
    itemClass: File,
    readOnly: true,
  }),
  events: Attributes.Collection({
    modelKey: 'events',
    itemClass: Event,
  }),
  folder: Attributes.Object({
    modelKey: 'folder',
    itemClass: Folder,
  }),
  labels: Attributes.Collection({
    modelKey: 'labels',
    itemClass: Label,
  }),
  metadata: Attributes.Object({
    modelKey: 'metadata',
  }),
  headers: Attributes.Object({
    modelKey: 'headers',
  }),
};
