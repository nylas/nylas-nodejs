import { BaseMessage } from './messages.js';

export interface CreateDraft extends BaseMessage {
  sendAt?: number;
  useDraft?: boolean;
  replyToMessageId?: string;
  trackingOptions?: TrackingOptions;
}

export interface Draft extends CreateDraft {
  id: string;
  grantId: string;
}

export type UpdateDraft = Partial<CreateDraft>;

export interface TrackingOptions {
  label?: string;
  links?: string;
  opens?: string;
  threadReplies?: string;
}
