import { Resource } from './resource';
import { Overrides } from '../config';
import {
  NylasDeleteResponse,
  NylasResponse,
  NylasListResponse,
} from '../models/response';
import {
  CreateGrantRequest,
  Grant,
  ListGrantsQueryParams,
  UpdateGrantRequest,
} from '../models/grants';

interface FindGrantParams {
  grantId: string;
}

interface CreateGrantParams {
  requestBody: CreateGrantRequest;
}

interface UpdateGrantParams {
  grantId: string;
  requestBody: UpdateGrantRequest;
}

interface DestroyGrantParams {
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
   * @param overrides Optional overrides to apply to this request
   * @param queryParams The query parameters to include in the request
   * @return The list of Grants
   */
  public async list(
    { overrides }: Overrides = {},
    queryParams?: ListGrantsQueryParams
  ): Promise<NylasListResponse<Grant>> {
    return super._list<NylasListResponse<Grant>>({
      queryParams,
      path: `/v3/grants`,
      overrides,
    });
  }

  /**
   * Return a Grant
   * @param grantId The id of the Grant to retrieve.
   * @param overrides Optional overrides to apply to this request
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
   * Create a Grant
   * @param requestBody The values to create the Grant with
   * @param overrides Optional overrides to apply to this request
   * @return The created Grant
   */
  public create({
    requestBody,
    overrides,
  }: CreateGrantParams & Overrides): Promise<NylasResponse<Grant>> {
    return super._create({
      path: `/v3/grants`,
      requestBody,
      overrides,
    });
  }

  /**
   * Update a Grant
   * @param grantId The id of the Grant to update.
   * @param requestBody The values to update the Grant with
   * @param overrides Optional overrides to apply to this request
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
   * @param grantId The id of the Grant to delete.
   * @param overrides Optional overrides to apply to this request
   * @return The deletion response
   */
  public destroy({
    grantId,
    overrides,
  }: DestroyGrantParams & Overrides): Promise<NylasDeleteResponse> {
    return super._destroy({
      path: `/v3/grants/${grantId}`,
      overrides,
    });
  }
}
