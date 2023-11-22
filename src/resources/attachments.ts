import { Overrides } from '../config.js';
import {
  Attachment,
  FindAttachmentQueryParams,
  DownloadAttachmentQueryParams,
} from '../models/attachments.js';
import { NylasResponse } from '../models/response.js';
import { Resource } from './resource.js';

/**
 * @property identifier The ID of the grant to act upon. Use "me" to refer to the grant associated with an access token.
 * @property attachmentId The ID of the attachment to act upon.
 * @property queryParams The query parameters to include in the request
 */
interface FindAttachmentParams {
  identifier: string;
  attachmentId: string;
  queryParams: FindAttachmentQueryParams;
}

/**
 * @property identifier The ID of the grant to act upon. Use "me" to refer to the grant associated with an access token.
 * @property attachmentId The ID of the attachment to act upon.
 * @property queryParams The query parameters to include in the request
 */
interface DownloadAttachmentParams {
  identifier: string;
  attachmentId: string;
  queryParams: DownloadAttachmentQueryParams;
}

/**
 * Nylas Attachments API
 *
 * The Nylas Attachments API allows you to retrieve metadata and download attachments.
 *
 * You can use the attachments schema in a Send v3 request to send attachments regardless of the email provider.
 * To include attachments in a Send v3 request, all attachments must be base64 encoded and the encoded data must be placed in the content field in the request body.
 *
 * If you are using draft support, the draft including the attachment is stored on the provider. If you are not using draft support, Nylas stores the attachment.
 *
 * Attachment size is currently limited by each provider.
 * 3MB for Gmail messages
 * 10MB for Microsoft messages
 *
 * You can also send attachments inline in an email message, for example for images that should be displayed in the email body content.
 */
export class Attachments extends Resource {
  /**
   * Returns an attachment by ID.
   * @return The Attachment metadata
   */
  public find({
    identifier,
    attachmentId,
    queryParams,
    overrides,
  }: FindAttachmentParams & Overrides): Promise<NylasResponse<Attachment>> {
    return super._find({
      path: `/v3/grants/${identifier}/attachments/${attachmentId}`,
      queryParams,
      overrides,
    });
  }

  /**
   * Returns an attachment by ID.
   * @return The Attachment file in binary format
   */
  public download({
    identifier,
    attachmentId,
    queryParams,
    overrides,
  }: DownloadAttachmentParams & Overrides): Promise<Buffer> {
    return super._getRaw({
      path: `/v3/grants/${identifier}/attachments/${attachmentId}/download`,
      queryParams,
      overrides,
    });
  }
}
