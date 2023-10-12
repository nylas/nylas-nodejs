import { EmailName } from './events.js';
import { CreateFileRequest, File } from './files.js';
import { ListQueryParams } from './listQueryParams.js';

export interface BaseCreateMessage {
  to: EmailName[];
  bcc?: EmailName[];
  cc?: EmailName[];
  from?: EmailName[];
  replyTo?: EmailName[];
  attachments?: CreateFileRequest[];
  snippet?: string;
  subject?: string;
  threadId?: string;
  body?: string;
  starred?: boolean;
  unread?: boolean;
}

export interface BaseMessage extends BaseCreateMessage {
  id: string;
  grantId: string;
  date: number;
  createdAt: number;
  folders: string[];
  attachments?: File[];
}

export interface Message extends BaseMessage {
  object: 'message';
  headers?: MessageHeaders[];
  metadata?: Record<string, unknown>;
}

export interface UpdateMessageRequest {
  starred?: boolean;
  unread?: boolean;
  folders?: string[];
  metadata?: Record<string, unknown>;
}

export interface MessageHeaders {
  name: string;
  value: string;
}

export enum MessageFields {
  STANDARD = 'standard',
  INCLUDE_HEADERS = 'include_headers',
}

export interface ListMessagesQueryParams extends ListQueryParams {
  subject?: string;
  anyEmail?: string[];
  to?: string[];
  from?: string[];
  cc?: string[];
  bcc?: string[];
  in?: string[];
  unread?: boolean;
  starred?: boolean;
  threadId?: string;
  receivedBefore?: number;
  receivedAfter?: number;
  hasAttachment?: boolean;
  fields?: MessageFields;
  searchQueryNative?: string;
}

export interface FindMessageQueryParams {
  fields?: MessageFields;
}
