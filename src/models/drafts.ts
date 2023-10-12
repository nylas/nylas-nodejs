import { BaseMessage, BaseCreateMessage } from './messages.js';

export interface CreateDraftRequest extends BaseCreateMessage {
  sendAt?: number;
  useDraft?: boolean;
  replyToMessageId?: string;
  trackingOptions?: TrackingOptions;
}

export interface Draft extends BaseMessage, CreateDraftRequest {
  object: 'draft';
}

export type UpdateDraftRequest = Partial<CreateDraftRequest>;

export interface TrackingOptions {
  label?: string;
  links?: string;
  opens?: string;
  threadReplies?: string;
}
