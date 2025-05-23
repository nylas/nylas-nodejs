import { Overrides } from '../config.js';
import {
  Attachment,
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
  }: DownloadAttachmentParams & Overrides): Promise<NodeJS.ReadableStream> {
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
}
