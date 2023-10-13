import { BaseMessage, BaseCreateMessage } from './messages.js';
import { ListQueryParams } from './listQueryParams.js';

export interface CreateDraftRequest extends BaseCreateMessage {
  sendAt?: number;
  useDraft?: boolean;
  replyToMessageId?: string;
  trackingOptions?: TrackingOptions;
}

export interface Draft
  extends BaseMessage,
    Omit<CreateDraftRequest, 'attachments'> {
  object: 'draft';
}

export type UpdateDraftRequest = Partial<CreateDraftRequest>;

export interface TrackingOptions {
  label?: string;
  links?: string;
  opens?: string;
  threadReplies?: string;
}

export interface ListDraftsQueryParams extends ListQueryParams {
  subject?: string;
  anyEmail?: string[];
  to?: string[];
  cc?: string[];
  bcc?: string[];
  starred?: boolean;
  threadId?: string;
  hasAttachment?: boolean;
}
