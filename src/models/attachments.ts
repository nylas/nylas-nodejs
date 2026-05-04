/**
 * Interface of an attachment object from Nylas.
 */
interface BaseAttachment {
  /**
   * Attachment's name.
   */
  filename: string;

  /**
   * Attachment's content type.
   */
  contentType: string;

  /**
   * If it's an inline attachment.
   */
  isInline?: boolean;

  /**
   * Attachment's size in bytes.
   */
  size?: number;

  /**
   * Content ID of the attachment.
   */
  contentId?: string;

  /**
   * Content disposition of the attachment.
   */
  contentDisposition?: string;
}

/**
 * Interface of a create attachment request.
 */
export interface CreateAttachmentRequest extends BaseAttachment {
  /**
   * Content of the attachment.
   * It can either be a readable stream, a base64 encoded string, or a buffer.
   * For attachments less than 3MB, the content can be a readable stream, or a base64 encoded string.
   * For attachments greater than 3MB, the content must be either a readable stream or a buffer.
   */
  content: NodeJS.ReadableStream | string | Buffer;
}

/**
 * Interface of an attachment object from Nylas.
 */
export interface Attachment extends BaseAttachment {
  /**
   * Attachment's ID.
   */
  id: string;

  /**
   * Grant ID of the Nylas account.
   */
  grantId: string;
}

/**
 * Interface representing of the query parameters for finding an attachment's metadata.
 */
export interface FindAttachmentQueryParams {
  /**
   * ID of the message the attachment belongs to.
   */
  messageId: string;
}

/**
 * Interface representing of the query parameters for downloading an attachment.
 */
export type DownloadAttachmentQueryParams = FindAttachmentQueryParams;

/**
 * Status of a large-attachment upload session.
 * @see https://developer.nylas.com/docs/v3/email/send-large-attachments/
 */
export type AttachmentUploadSessionStatusType =
  | 'uploading'
  | 'ready'
  | 'failed'
  | 'expired';

/**
 * Request body for creating a large-attachment upload session.
 * Sent to the API as snake_case (`content_type`, etc.).
 */
export interface CreateAttachmentUploadSessionRequest {
  /**
   * The name of the file as it will appear in the email.
   */
  filename: string;
  /**
   * MIME type of the file (for example, `application/pdf`).
   */
  contentType: string;
  /**
   * Expected file size in bytes. Recommended — Nylas validates the upload matches at completion.
   * Maximum: 157286400 (150 MB).
   */
  size?: number;
}

/**
 * Upload session returned when creating a large-attachment upload session.
 * Corresponds to the `data` object in the create-session API response.
 */
export interface AttachmentUploadSession {
  /**
   * Unique identifier for the upload session. Use when completing the session and when referencing the attachment in send or draft.
   */
  attachmentId: string;
  /**
   * HTTP method to use when uploading to {@link AttachmentUploadSession.url}. Always `PUT`.
   */
  method: string;
  /**
   * Pre-signed URL to upload file bytes (no Nylas auth header on this request).
   */
  url: string;
  /**
   * Headers to include when uploading to {@link AttachmentUploadSession.url}.
   */
  headers: Record<string, string>;
  /**
   * When the upload session expires (RFC 3339).
   */
  expiresAt: string;
  /**
   * Maximum allowed file size in bytes.
   */
  maxSize: number;
  /**
   * Expected file size in bytes, echoing the request. `0` if `size` was omitted on creation.
   */
  size: number;
  /**
   * MIME type of the file.
   */
  contentType: string;
  /**
   * Name of the file.
   */
  filename: string;
  /**
   * The grant ID the upload session belongs to.
   */
  grantId: string;
}

/**
 * Normalized upload session record from `GET /v3/grants/{grant_id}/attachment-uploads/{attachment_id}`.
 *
 * The API returns PascalCase keys and no `{ request_id, data }` envelope; the SDK still parses JSON
 * and converts keys to camelCase like other endpoints.
 */
export interface AttachmentUploadSessionStatus {
  /**
   * The attachment upload session ID.
   */
  id: string;
  /**
   * The grant ID the upload session belongs to.
   */
  grantId: string;
  /**
   * Name of the file.
   */
  filename: string;
  /**
   * MIME type of the file.
   */
  contentType: string;
  /**
   * Declared file size in bytes, or `0` if `size` was not provided on session creation.
   */
  expectedSize: number;
  /**
   * Current status of the upload session.
   */
  status: AttachmentUploadSessionStatusType;
  /**
   * When the upload session was created (RFC 3339).
   */
  createdAt: string;
  /**
   * When the upload session expires (RFC 3339).
   */
  expiresAt: string;
}

/**
 * Result of completing an upload session (`data` in the complete API response).
 */
export interface AttachmentUploadSessionComplete {
  attachmentId: string;
  grantId: string;
  /**
   * After successful completion, typically `ready`.
   */
  status: AttachmentUploadSessionStatusType;
}
