/**
 * Interface of an attachment object from Nylas.
 */
export interface Attachment {
  /**
   * A globally unique object identifier.
   */
  id: string;

  /**
   * Attachment's name.
   */
  filename: string;

  /**
   * Attachment's content type.
   */
  contentType: string;

  /**
   * Grant ID of the Nylas account.
   */
  grantId: string;

  /**
   * If it's an inline attachment.
   */
  isInline: boolean;

  /**
   * Attachment's size in bytes.
   */
  size: number;
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
