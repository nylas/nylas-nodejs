import { AsyncListResponse, Resource } from './resource.js';
import {
  CreateDraftRequest,
  Draft,
  ListDraftsQueryParams,
  UpdateDraftRequest,
} from '../models/drafts.js';
import { Overrides } from '../config.js';
import {
  NylasDeleteResponse,
  NylasListResponse,
  NylasResponse,
} from '../models/response.js';
import { Messages } from './messages.js';

interface ListDraftsParams {
  identifier: string;
  queryParams?: ListDraftsQueryParams;
}

interface FindDraftParams {
  identifier: string;
  draftId: string;
}

interface CreateDraftParams {
  identifier: string;
  draftId: string;
  requestBody: CreateDraftRequest;
}

interface UpdateDraftParams {
  identifier: string;
  draftId: string;
  requestBody: UpdateDraftRequest;
}

type DestroyDraftParams = FindDraftParams;
type SendDraftParams = FindDraftParams;

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
      path: `/v3/grants/${identifier}/drafts`,
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
      path: `/v3/grants/${identifier}/drafts/${draftId}`,
      overrides,
    });
  }

  /**
   * Return a Draft
   * @return The draft
   */
  public create({
    identifier,
    draftId,
    requestBody,
    overrides,
  }: CreateDraftParams & Overrides): Promise<NylasResponse<Draft>> {
    const form = Messages._buildFormRequest(requestBody);

    return this.apiClient.request({
      method: 'POST',
      path: `/v3/grants/${identifier}/drafts/${draftId}`,
      form,
      overrides,
    });
  }

  /**
   * Update a Draft
   * @return The updated draft
   */
  public update({
    identifier,
    draftId,
    requestBody,
    overrides,
  }: UpdateDraftParams & Overrides): Promise<NylasResponse<Draft>> {
    return super._update({
      path: `/v3/grants/${identifier}/drafts/${draftId}`,
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
  }: DestroyDraftParams & Overrides): Promise<NylasDeleteResponse> {
    return super._destroy({
      path: `/v3/grants/${identifier}/drafts/${draftId}`,
      overrides,
    });
  }

  /**
   * Send a Draft
   * @return The draft
   */
  public send({
    identifier,
    draftId,
    overrides,
  }: SendDraftParams & Overrides): Promise<NylasResponse<Draft>> {
    return super._create({
      path: `/v3/grants/${identifier}/drafts/${draftId}`,
      requestBody: {},
      overrides,
    });
  }
}
