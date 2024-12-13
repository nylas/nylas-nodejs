import { Draft } from './drafts.js';
import { EmailName } from './events.js';
import { ListQueryParams } from './listQueryParams.js';
import { Message } from './messages.js';

/**
 * Interface representing a Nylas thread object.
 */
export interface Thread {
  /**
   * The unique identifier for the thread.
   */
  id: string;
  /**
   * Grant ID of the Nylas account.
   */
  grantId: string;
  /**
   * The latest message or draft in the thread.
   */
  latestDraftOrMessage: Message | Draft;
  /**
   * Whether or not a message in a thread has attachments.
   */
  hasAttachments: boolean;
  /**
   * Whether or not a message in a thread has drafts.
   */
  hasDrafts: boolean;
  /**
   * A boolean indicating whether the thread is starred or not.
   */
  starred: boolean;
  /**
   * A boolean indicating if all messages within the thread are read or not.
   */
  unread: boolean;
  /**
   * Unix timestamp of the earliest or first message in the thread.
   */
  earliestMessageDate: number;
  /**
   * Unix timestamp of the most recent message received in the thread.
   */
  latestMessageReceivedDate?: number;
  /**
   * Unix timestamp of the most recent message sent in the thread.
   */
  latestMessageSentDate?: number;
  /**
   * An array of participants in the thread.
   */
  participants: EmailName[];
  /**
   * An array of message IDs in the thread.
   */
  messageIds: string[];
  /**
   * An array of draft IDs in the thread.
   */
  draftIds: string[];
  /**
   * An array of folder IDs the thread appears in.
   */
  folders: string[];
  /**
   * The type of object.
   */
  object: 'thread';
  /**
   * A short snippet of the last received message/draft body.
   * This is the first 100 characters of the message body, with any HTML tags removed.
   */
  snippet?: string;
  /**
   * The subject line of the thread.
   */
  subject?: string;
}

/**
 * Interface representing a request to update a thread.
 */
export interface UpdateThreadRequest {
  /**
   * Sets all messages in the thread as starred or unstarred.
   */
  starred?: boolean;
  /**
   * Sets all messages in the thread as read or unread.
   */
  unread?: boolean;
  /**
   * The IDs of the folders to apply, overwriting all previous folders for all messages in the thread.
   */
  folders?: string[];
}

/**
 * Interface representing the query parameters for listing drafts.
 */
export interface ListThreadsQueryParams extends ListQueryParams {
  /**
   * Return items with a matching literal subject.
   */
  subject?: string;
  /**
   * Return threads that contain messages that have been sent or received from this list of email addresses.
   */
  anyEmail?: string[];
  /**
   * Return threads containing messages sent to these email address.
   */
  to?: string[];
  /**
   * Return threads containing messages sent from these email address.
   */
  from?: string[];
  /**
   * Return threads containing messages cc'd on these email address.
   */
  cc?: string[];
  /**
   * Return threads containing messages bcc'd on these email address.
   */
  bcc?: string[];
  /**
   * Return threads with messages that belong to these specified folder IDs.
   */
  in?: string[];
  /**
   * Return threads with unread messages.
   */
  unread?: boolean;
  /**
   * Return threads with starred messages.
   */
  starred?: boolean;
  /**
   * Return threads whose most recent message was received before this Unix timestamp.
   */
  latestMessageBefore?: number;
  /**
   * Return threads whose most recent message was received after this Unix timestamp.
   */
  latestMessageAfter?: number;
  /**
   * Return threads with messages that contain attachments.
   */
  hasAttachment?: boolean;
  /**
   * The provider-specific query string used to search threads.
   * Available for Google only.
   */
  searchQueryNative?: string;
}
