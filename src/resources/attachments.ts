import { Overrides } from '../config.js';
import {
  Attachment,
  AttachmentUploadSession,
  AttachmentUploadSessionComplete,
  CreateAttachmentUploadSessionRequest,
  FindAttachmentQueryParams,
  DownloadAttachmentQueryParams,
} from '../models/attachments.js';
import { NylasResponse } from '../models/response.js';
import { makePathParams } from '../utils.js';
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
 * @property identifier The ID of the grant to act upon.
 * @property requestBody Session details (filename, content type, optional size).
 */
interface CreateAttachmentUploadSessionParams {
  identifier: string;
  requestBody: CreateAttachmentUploadSessionRequest;
}

/**
 * @property identifier The ID of the grant to act upon.
 * @property attachmentId The attachment upload session ID.
 */
interface CompleteAttachmentUploadSessionParams {
  identifier: string;
  attachmentId: string;
}

/**
 * Nylas Attachments API
 *
 * The Nylas Attachments API allows you to retrieve metadata and download attachments.
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
      path: makePathParams(
        '/v3/grants/{identifier}/attachments/{attachmentId}',
        { identifier, attachmentId }
      ),
      queryParams,
      overrides,
    });
  }

  /**
   * Download the attachment data
   *
   * This method returns a NodeJS.ReadableStream which can be used to stream the attachment data.
   * This is particularly useful for handling large attachments efficiently, as it avoids loading
   * the entire file into memory. The stream can be piped to a file stream or used in any other way
   * that Node.js streams are typically used.
   *
   * @param identifier Grant ID or email account to query
   * @param attachmentId The id of the attachment to download.
   * @param queryParams The query parameters to include in the request
   * @returns {NodeJS.ReadableStream} The ReadableStream containing the file data.
   */
  public download({
    identifier,
    attachmentId,
    queryParams,
    overrides,
  }: DownloadAttachmentParams & Overrides): Promise<
    ReadableStream<Uint8Array>
  > {
    return this._getStream({
      path: makePathParams(
        '/v3/grants/{identifier}/attachments/{attachmentId}/download',
        { identifier, attachmentId }
      ),
      queryParams,
      overrides,
    });
  }

  /**
   * Download the attachment as a byte array
   * @param identifier Grant ID or email account to query
   * @param attachmentId The id of the attachment to download.
   * @param queryParams The query parameters to include in the request
   * @return The raw file data
   */
  public downloadBytes({
    identifier,
    attachmentId,
    queryParams,
    overrides,
  }: DownloadAttachmentParams & Overrides): Promise<Buffer> {
    return super._getRaw({
      path: makePathParams(
        '/v3/grants/{identifier}/attachments/{attachmentId}/download',
        { identifier, attachmentId }
      ),
      queryParams,
      overrides,
    });
  }

  /**
   * Create a resumable upload session for a large attachment (up to 150 MB).
   * Upload bytes to the returned `url`, then call {@link Attachments.completeUploadSession}.
   *
   * @see https://developer.nylas.com/docs/v3/email/send-large-attachments/
   * @return Session details including `attachmentId` and pre-signed `url`
   */
  public createUploadSession({
    identifier,
    requestBody,
    overrides,
  }: CreateAttachmentUploadSessionParams & Overrides): Promise<
    NylasResponse<AttachmentUploadSession>
  > {
    return super._create({
      path: makePathParams('/v3/grants/{identifier}/attachment-uploads', {
        identifier,
      }),
      requestBody,
      overrides,
    });
  }

  /**
   * Complete an upload session after the file has been uploaded to the pre-signed URL.
   *
   * @see https://developer.nylas.com/docs/v3/email/send-large-attachments/
   */
  public completeUploadSession({
    identifier,
    attachmentId,
    overrides,
  }: CompleteAttachmentUploadSessionParams & Overrides): Promise<
    NylasResponse<AttachmentUploadSessionComplete>
  > {
    return super._create({
      path: makePathParams(
        '/v3/grants/{identifier}/attachment-uploads/{attachmentId}/complete',
        { identifier, attachmentId }
      ),
      requestBody: {},
      overrides,
    });
  }
}
