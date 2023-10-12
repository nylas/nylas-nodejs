import { BaseMessage, BaseCreateMessage } from './messages.js';

export interface CreateDraft extends BaseCreateMessage {
  sendAt?: number;
  useDraft?: boolean;
  replyToMessageId?: string;
  trackingOptions?: TrackingOptions;
}

export interface Draft extends BaseMessage, CreateDraft {
  object: 'draft';
}

export type UpdateDraft = Partial<CreateDraft>;

export interface TrackingOptions {
  label?: string;
  links?: string;
  opens?: string;
  threadReplies?: string;
}
