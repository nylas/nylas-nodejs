import RestfulModel from './restful-model';
import Attributes, { Attribute } from './attributes';
import File, { FileProperties } from './file';
import Event, { EventProperties } from './event';
import EmailParticipant, {
  EmailParticipantProperties,
} from './email-participant';
import Folder, { Label, FolderProperties } from './folder';
import NylasConnection from '../nylas-connection';

export type MessageProperties = {
  to: EmailParticipantProperties[];
  subject?: string;
  from?: EmailParticipantProperties[];
  replyTo?: EmailParticipantProperties[];
  cc?: EmailParticipantProperties[];
  bcc?: EmailParticipantProperties[];
  date?: Date;
  threadId?: string;
  snippet?: string;
  body?: string;
  unread?: boolean;
  starred?: boolean;
  files?: FileProperties[];
  events?: EventProperties[];
  folder?: Folder;
  labels?: FolderProperties[];
  headers?: Record<string, string>;
  metadata?: object;
  jobStatusId?: string;
};

export default class Message extends RestfulModel implements MessageProperties {
  to: EmailParticipant[] = [];
  subject?: string;
  from?: EmailParticipant[];
  replyTo?: EmailParticipant[];
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
  headers?: Record<string, string>;
  metadata?: object;
  jobStatusId?: string;
  static collectionName = 'messages';
  static attributes: Record<string, Attribute> = {
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
    jobStatusId: Attributes.String({
      modelKey: 'jobStatusId',
      jsonKey: 'job_status_id',
      readOnly: true,
    }),
  };

  constructor(connection: NylasConnection, props?: MessageProperties) {
    super(connection, props);
    this.initAttributes(props);
  }

  // We calculate the list of participants instead of grabbing it from
  // a parent because it is a better source of ground truth, and saves us
  // from more dependencies.
  participants(): EmailParticipant[] {
    const participants: Record<string, EmailParticipant> = {};
    const to = this.to || [];
    const cc = this.cc || [];
    const from = this.from || [];
    const contacts = Array.from(new Set([...to, ...cc, ...from]));
    for (const contact of contacts) {
      if (contact && (contact.email ? contact.email.length : '') > 0) {
        participants[
          `${contact.email || ''.toLowerCase().trim()} ${(contact.name || '')
            .toLowerCase()
            .trim()}`
        ] = new EmailParticipant(contact);
      }
    }
    return Object.values(participants);
  }

  fileIds(): (string | undefined)[] {
    return this.files ? this.files.map(file => file.id) : [];
  }

  getRaw(): Promise<string> {
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

  saveRequestBody(): Record<string, unknown> {
    // It's possible to update most of the fields of a draft.
    if (this.constructor.name === 'Draft') {
      return super.saveRequestBody();
    }

    // Messages are more limited, though.
    const json: Record<string, unknown> = {};
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
}
