import { Overrides } from '../config.js';
import { Messages } from './messages.js';
import { AsyncListResponse, Resource } from './resource.js';
import {
  CreateDraftRequest,
  Draft,
  ListDraftsQueryParams,
  UpdateDraftRequest,
} from '../models/drafts.js';
import { Message } from '../models/messages.js';
import {
  NylasBaseResponse,
  NylasListResponse,
  NylasResponse,
} from '../models/response.js';
import {
  encodeAttachmentContent,
  calculateTotalPayloadSize,
} from '../utils.js';
import { makePathParams } from '../utils.js';
/**
 * The parameters for the {@link Drafts.list} method
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
export interface ListDraftsParams {
  identifier: string;
  queryParams?: ListDraftsQueryParams;
}

/**
 * The parameters for the {@link Drafts.find} method
 * @property identifier The identifier of the grant to act upon
 * @property draftId The id of the draft to retrieve.
 */
export interface FindDraftParams {
  identifier: string;
  draftId: string;
}

/**
 * The parameters for the {@link Drafts.create} method
 * @property identifier The identifier of the grant to act upon
 * @property requestBody The values to create the message with
 */
export interface CreateDraftParams {
  identifier: string;
  requestBody: CreateDraftRequest;
}

/**
 * The parameters for the {@link Drafts.update} method
 * @property identifier The identifier of the grant to act upon
 * @property draftId The id of the draft to update.
 * @property requestBody The values to update the draft with
 */
export interface UpdateDraftParams {
  identifier: string;
  draftId: string;
  requestBody: UpdateDraftRequest;
}

/**
 * The parameters for the {@link Drafts.destroy} method
 */
export type DestroyDraftParams = FindDraftParams;

/**
 * The parameters for the {@link Drafts.send} method
 */
export type SendDraftParams = FindDraftParams;

/**
 * Nylas Drafts API
 *
 * The Nylas Drafts API allows you to list, find, update, delete, and send drafts on user accounts.
 */
export class Drafts extends Resource {
  /**
   * Return all Drafts
   * @return A list of drafts
   */
  public list({
    identifier,
    queryParams,
    overrides,
  }: ListDraftsParams & Overrides): AsyncListResponse<
    NylasListResponse<Draft>
  > {
    return super._list<NylasListResponse<Draft>>({
      queryParams,
      overrides,
      path: makePathParams('/v3/grants/{identifier}/drafts', { identifier }),
    });
  }

  /**
   * Return a Draft
   * @return The draft
   */
  public find({
    identifier,
    draftId,
    overrides,
  }: FindDraftParams & Overrides): Promise<NylasResponse<Draft>> {
    return super._find({
      path: makePathParams('/v3/grants/{identifier}/drafts/{draftId}', {
        identifier,
        draftId,
      }),
      overrides,
    });
  }

  /**
   * Return a Draft
   * @return The draft
   */
  public async create({
    identifier,
    requestBody,
    overrides,
  }: CreateDraftParams & Overrides): Promise<NylasResponse<Draft>> {
    const path = makePathParams('/v3/grants/{identifier}/drafts', {
      identifier,
    });

    // Use form data if the total payload size (body + attachments) is greater than 3mb
    const totalPayloadSize = calculateTotalPayloadSize(requestBody);

    if (totalPayloadSize >= Messages.MAXIMUM_JSON_ATTACHMENT_SIZE) {
      const form = Messages._buildFormRequest(requestBody);

      return this.apiClient.request({
        method: 'POST',
        path,
        form,
        overrides,
      });
    } else if (requestBody.attachments) {
      const processedAttachments = await encodeAttachmentContent(
        requestBody.attachments
      );

      requestBody = {
        ...requestBody,
        attachments: processedAttachments,
      };
    }

    return super._create({
      path,
      requestBody,
      overrides,
    });
  }

  /**
   * Update a Draft
   * @return The updated draft
   */
  public async update({
    identifier,
    draftId,
    requestBody,
    overrides,
  }: UpdateDraftParams & Overrides): Promise<NylasResponse<Draft>> {
    const path = makePathParams('/v3/grants/{identifier}/drafts/{draftId}', {
      identifier,
      draftId,
    });

    // Use form data if the total payload size (body + attachments) is greater than 3mb
    const totalPayloadSize = calculateTotalPayloadSize(requestBody);

    if (totalPayloadSize >= Messages.MAXIMUM_JSON_ATTACHMENT_SIZE) {
      const form = Messages._buildFormRequest(requestBody);

      return this.apiClient.request({
        method: 'PUT',
        path,
        form,
        overrides,
      });
    } else if (requestBody.attachments) {
      const processedAttachments = await encodeAttachmentContent(
        requestBody.attachments
      );

      requestBody = {
        ...requestBody,
        attachments: processedAttachments,
      };
    }

    return super._update({
      path,
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a Draft
   * @return The deleted draft
   */
  public destroy({
    identifier,
    draftId,
    overrides,
  }: DestroyDraftParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: makePathParams('/v3/grants/{identifier}/drafts/{draftId}', {
        identifier,
        draftId,
      }),
      overrides,
    });
  }

  /**
   * Send a Draft
   * @return The sent message
   */
  public send({
    identifier,
    draftId,
    overrides,
  }: SendDraftParams & Overrides): Promise<NylasResponse<Message>> {
    return super._create({
      path: makePathParams('/v3/grants/{identifier}/drafts/{draftId}', {
        identifier,
        draftId,
      }),
      requestBody: {},
      overrides,
    });
  }
}
