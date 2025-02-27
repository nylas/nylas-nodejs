import { Resource } from './resource.js';
import { Overrides } from '../config.js';
import {
  NylasBaseResponse,
  NylasResponse,
  NylasListResponse,
} from '../models/response.js';
import {
  Grant,
  ListGrantsQueryParams,
  UpdateGrantRequest,
} from '../models/grants.js';
import { ListQueryParams } from '../models/listQueryParams.js';

/**
 * @property queryParams The query parameters to include in the request
 */
export interface ListGrantsParams {
  queryParams?: ListGrantsQueryParams;
}

/**
 * @property grantId The id of the Grant to retrieve.
 */
export interface FindGrantParams {
  grantId: string;
}

/**
 * @property grantId The id of the Grant to update.
 * @property requestBody The values to update the Grant with.
 */
export interface UpdateGrantParams {
  grantId: string;
  requestBody: UpdateGrantRequest;
}

/**
 * @property grantId The id of the Grant to delete.
 */
export interface DestroyGrantParams {
  grantId: string;
}

/**
 * Nylas Grants API
 *
 * The Nylas Grants API allows for the management of grants.
 */
export class Grants extends Resource {
  /**
   * Return all Grants
   * @return The list of Grants
   */
  public async list(
    { overrides, queryParams }: Overrides & ListGrantsParams = {},
    /**
     * @deprecated Use `queryParams` instead.
     */
    _queryParams?: ListQueryParams
  ): Promise<NylasListResponse<Grant>> {
    return super._list<NylasListResponse<Grant>>({
      queryParams: queryParams ?? _queryParams ?? undefined,
      path: `/v3/grants`,
      overrides: overrides ?? {},
    });
  }

  /**
   * Return a Grant
   * @return The Grant
   */
  public find({
    grantId,
    overrides,
  }: FindGrantParams & Overrides): Promise<NylasResponse<Grant>> {
    return super._find({
      path: `/v3/grants/${grantId}`,
      overrides,
    });
  }

  /**
   * Update a Grant
   * @return The updated Grant
   */
  public update({
    grantId,
    requestBody,
    overrides,
  }: UpdateGrantParams & Overrides): Promise<NylasResponse<Grant>> {
    return super._updatePatch({
      path: `/v3/grants/${grantId}`,
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a Grant
   * @return The deletion response
   */
  public destroy({
    grantId,
    overrides,
  }: DestroyGrantParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: `/v3/grants/${grantId}`,
      overrides,
    });
  }
}
