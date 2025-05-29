import { Attachment } from './attachments.js';
import { EmailName } from './events.js';
import { ListQueryParams } from './listQueryParams.js';

/**
 * @internal Internal interface for a message.
 */
export interface BaseMessage {
  /**
   * The unique identifier for the message.
   */
  id: string;
  /**
   * Grant ID of the Nylas account.
   */
  grantId: string;
  /**
   * Unix timestamp of when the message was received by the mail server.
   * This may be different from the unverified Date header in raw message object.
   */
  date: number;
  /**
   * The ID of the folder(s) the message appears in.
   */
  folders: string[];
  /**
   * An array of message recipients.
   */
  to: EmailName[];
  /**
   * An array of bcc recipients.
   */
  bcc?: EmailName[];
  /**
   * An array of cc recipients.
   */
  cc?: EmailName[];
  /**
   * An array of name and email pairs that override the sent reply-to headers.
   */
  replyTo?: EmailName[];
  /**
   * The message subject.
   */
  subject?: string;
  /**
   * The full HTML message body.
   * Messages with only plain-text representations are up-converted to HTML.
   */
  body?: string;
  /**
   * Whether or not the message has been starred by the user.
   */
  starred?: boolean;
  /**
   * An array of message senders.
   */
  from?: EmailName[];
  /**
   * An array of files attached to the message.
   */
  attachments?: Attachment[];
  /**
   * A short snippet of the message body.
   * This is the first 100 characters of the message body, with any HTML tags removed.
   */
  snippet?: string;
  /**
   * A reference to the parent thread object.
   * If this is a new draft, the thread will be empty.
   */
  threadId?: string;
  /**
   * Whether or not the message has been read by the user.
   */
  unread?: boolean;
}

/**
 * Interface representing message tracking options.
 */
export interface MessageTrackingOptions {
  /**
   * When true, shows that message open tracking is enabled.
   */
  opens: boolean;
  /**
   * When true, shows that thread replied tracking is enabled.
   */
  threadReplies: boolean;
  /**
   * When true, shows that link clicked tracking is enabled.
   */
  links: boolean;
  /**
   * A label describing the message tracking purpose.
   * Maximum length: 2048 characters.
   */
  label: string;
}

/**
 * Interface representing a Nylas Message object.
 */
export interface Message extends BaseMessage {
  /**
   * The type of object.
   */
  object: 'message';
  /**
   * The message headers.
   * Only present if the 'fields' query parameter is set to includeHeaders.
   */
  headers?: MessageHeaders[];
  /**
   * The message tracking options.
   * Only present if the 'fields' query parameter is set to include_tracking_options.
   */
  trackingOptions?: MessageTrackingOptions;
  /**
   * A Base64url-encoded string containing the message data (including the body content).
   * Only present if the 'fields' query parameter is set to raw_mime.
   * When this field is requested, only grant_id, object, id, and raw_mime fields are returned.
   */
  rawMime?: string;
  /**
   * A list of key-value pairs storing additional data.
   */
  metadata?: Record<string, unknown>;
  /**
   * The unique identifier for the scheduled message.
   */
  scheduleId?: string;
  /**
   * Unix timestamp to send the message at.
   */
  sendAt?: number;
  /**
   * Whether or not to use draft support.
   * This is primarily used when dealing with large attachments.
   */
  useDraft?: boolean;
}

/**
 * Interface representing a request to update a message.
 */
export interface UpdateMessageRequest {
  /**
   * Sets the message as starred or unstarred.
   */
  starred?: boolean;
  /**
   * Sets the message as read or unread.
   */
  unread?: boolean;
  /**
   * The IDs of the folders the message should appear in.
   */
  folders?: string[];
  /**
   * A list of key-value pairs storing additional data.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Interface representing a message header.
 */
export interface MessageHeaders {
  /**
   * The header name.
   */
  name: string;
  /**
   * The header value.
   */
  value: string;
}

/**
 * Enum representing the message fields that can be included in a response.
 */
export enum MessageFields {
  STANDARD = 'standard',
  INCLUDE_HEADERS = 'include_headers',
  INCLUDE_TRACKING_OPTIONS = 'include_tracking_options',
  RAW_MIME = 'raw_mime',
}

/**
 * Interface representing information about a scheduled message.
 */
export interface ScheduledMessage {
  /**
   * The unique identifier for the scheduled message.
   */
  scheduleId: number;
  /**
   * The status of the scheduled message.
   */
  status: ScheduledMessageStatus;
  /**
   * The time the message was sent or failed to send, in epoch time.
   */
  closeTime?: number;
}

/**
 * Interface representing a list of scheduled messages.
 */
export interface ScheduledMessagesList {
  /**
   * The list of scheduled messages.
   */
  schedules: ScheduledMessage[];
}

/**
 * Interface representing a scheduled message status.
 */
export interface ScheduledMessageStatus {
  /**
   * The status code the describes the state of the scheduled message
   */
  code: string;
  /**
   * A description of the status of the scheduled message
   */
  description: string;
}

/**
 * Interface representing a response after stopping a scheduled message.
 */
export interface StopScheduledMessageResponse {
  /**
   * A message describing the result of the request.
   */
  message: string;
}

/**
 * Interface representing the query parameters for listing messages.
 */
export interface ListMessagesQueryParams extends ListQueryParams {
  /**
   * Return items with a matching literal subject.
   */
  subject?: string;
  /**
   * Return emails that have been sent or received from this list of email addresses.
   */
  anyEmail?: string[];
  /**
   * Return items containing messages sent to these email address.
   */
  to?: string[];
  /**
   * Return items containing messages sent from these email address.
   */
  from?: string[];
  /**
   * Return items containing messages cc'd on these email address.
   */
  cc?: string[];
  /**
   * Return items containing messages bcc'd on these email address.
   */
  bcc?: string[];
  /**
   * Return emails that are in these folder IDs.
   */
  in?: string[];
  /**
   * Return emails that are unread.
   */
  unread?: boolean;
  /**
   * Return emails that are starred.
   */
  starred?: boolean;
  /**
   * Return emails that belong to this thread.
   */
  threadId?: string;
  /**
   * Return emails that have been received before this timestamp.
   */
  receivedBefore?: number;
  /**
   * Return emails that have been received after this timestamp.
   */
  receivedAfter?: number;
  /**
   * Return emails that contain attachments.
   */
  hasAttachment?: boolean;
  /**
   * Allows you to specify to return messages with headers included.
   */
  fields?: MessageFields;
  /**
   * The provider-specific query string used to search messages.
   * Available for Google and Microsoft Graph only.
   */
  searchQueryNative?: string;
}

/**
 * Interface representing the query parameters for finding a message.
 */
export interface FindMessageQueryParams {
  /**
   * Allows you to specify to the message with headers included.
   */
  fields?: MessageFields;
}

/**
 * Interface representing the request to clean a message.
 */
export interface CleanMessagesRequest {
  /**
   * IDs of the email messages to clean.
   */
  messageId: string[];
  /**
   * If true, removes link-related tags (<a>) from the email message while keeping the text.
   */
  ignoreLinks?: boolean;
  /**
   * If true, removes images from the email message.
   */
  ignoreImages?: boolean;
  /**
   * If true, converts images in the email message to Markdown.
   */
  imagesAsMarkdown?: boolean;
  /**
   * If true, removes table-related tags (<table>, <th>, <td>, <tr>) from the email message while keeping rows.
   */
  ignoreTables?: boolean;
  /**
   * If true, removes phrases such as "Best" and "Regards" in the email message signature.
   */
  removeConclusionPhrases?: boolean;
}

/**
 * Interface representing the response after cleaning a message.
 */
export interface CleanMessagesResponse extends Message {
  /**
   * The cleaned HTML message body.
   */
  conversation: string;
}
