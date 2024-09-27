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
   * It can either be a readable stream or a base64 encoded string.
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
