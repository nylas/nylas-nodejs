import { BaseMessage, BaseCreateMessage } from './messages.js';
import { ListQueryParams } from './listQueryParams.js';

/**
 * Interface representing a request to create a draft.
 */
export interface CreateDraftRequest extends BaseCreateMessage {
  /**
   * Unix timestamp to send the message at.
   */
  sendAt?: number;
  /**
   * The ID of the message that you are replying to.
   */
  replyToMessageId?: string;
  /**
   * Options for tracking opens, links, and thread replies.
   */
  trackingOptions?: TrackingOptions;
}

/**
 * Interface representing a request to send a message.
 */
export interface SendMessageRequest extends CreateDraftRequest {
  /**
   * Whether or not to use draft support.
   * This is primarily used when dealing with large attachments.
   */
  useDraft?: boolean;
}

/**
 * Interface representing a Nylas Draft object.
 */
export interface Draft
  extends BaseMessage,
    Omit<CreateDraftRequest, 'attachments'> {
  /**
   * The type of object.
   */
  object: 'draft';
}

/**
 * Interface representing a request to update a draft.
 */
export type UpdateDraftRequest = Partial<CreateDraftRequest> & {
  /**
   * Return drafts that are unread.
   */
  unread?: boolean;
};

/**
 * Interface representing the different tracking options for when a message is sent.
 */
export interface TrackingOptions {
  label?: string;
  links?: boolean;
  opens?: boolean;
  threadReplies?: boolean;
}

/**
 * Interface representing the query parameters for listing drafts.
 */
export interface ListDraftsQueryParams extends ListQueryParams {
  /**
   * Return items with a matching literal subject.
   */
  subject?: string;
  /**
   * Return emails that have been sent or received from this list of email addresses.
   */
  anyEmail?: string[];
  /**
   * Return items containing drafts to be sent these email address.
   */
  to?: string[];
  /**
   * Return items containing drafts cc'ing these email address.
   */
  cc?: string[];
  /**
   * Return items containing drafts bcc'ing these email address.
   */
  bcc?: string[];
  /**
   * Return drafts that are unread.
   */
  unread?: boolean;
  /**
   * Return drafts that are starred.
   */
  starred?: boolean;
  /**
   * Return drafts that belong to this thread.
   */
  threadId?: string;
  /**
   * Return drafts that contain attachments.
   */
  hasAttachment?: boolean;
}
