import { EmailName } from './events.js';
import { File } from './files.js';

export interface BaseMessage {
  to: EmailName[];
  bcc?: EmailName[];
  cc?: EmailName[];
  from?: EmailName[];
  replyTo?: EmailName[];
  attachments?: File[];
  snippet?: string;
  subject?: string;
  threadId?: string;
  body?: string;
  starred?: boolean;
  unread?: boolean;
}

export interface Message extends BaseMessage {
  id: string;
  grantId: string;
  date: number;
  folders?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateMessage {
  starred?: boolean;
  unread?: boolean;
  folders?: string[];
  metadata?: Record<string, unknown>;
}
