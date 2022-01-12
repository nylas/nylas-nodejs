import Message, { MessageProperties } from './message';
import RestfulModel, { SaveCallback } from './restful-model';
import Attributes from './attributes';
import EmailParticipant, {
  EmailParticipantProperties,
} from './email-participant';
import Folder, { Label, FolderProperties } from './folder';
import NylasConnection from '../nylas-connection';

export type ThreadProperties = {
  subject: string;
  participants: EmailParticipantProperties[];
  lastMessageTimestamp: Date;
  lastMessageReceivedTimestamp: Date;
  firstMessageTimestamp: Date;
  messageIds: string[];
  snippet: string;
  unread: boolean;
  starred: boolean;
  version: string;
  hasAttachments?: boolean;
  lastMessageSentTimestamp?: Date;
  folders?: FolderProperties[];
  labels?: FolderProperties[];
  draftIds?: string[];
  messages?: MessageProperties[];
  drafts?: MessageProperties[];
};

export default class Thread extends RestfulModel implements ThreadProperties {
  subject = '';
  participants: EmailParticipant[] = [];
  lastMessageTimestamp: Date = new Date();
  lastMessageReceivedTimestamp: Date = new Date();
  firstMessageTimestamp: Date = new Date();
  messageIds: string[] = [];
  snippet = '';
  unread = false;
  starred = false;
  version = '';
  hasAttachments?: boolean;
  lastMessageSentTimestamp?: Date;
  folders?: Folder[];
  labels?: Label[];
  draftIds?: string[];
  messages?: Message[];
  drafts?: Message[];

  constructor(connection: NylasConnection, props?: ThreadProperties) {
    super(connection, props);
    this.initAttributes(props);
  }

  saveRequestBody(): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    if (this.labels) {
      json['label_ids'] = this.labels.map(label => label.id);
    } else if (this.folders && this.folders.length === 1) {
      json['folder_id'] = this.folders[0].id;
    }

    json['starred'] = this.starred;
    json['unread'] = this.unread;
    return json;
  }

  save(params: {} | SaveCallback = {}, callback?: SaveCallback): Promise<this> {
    return super.save(params, callback);
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
