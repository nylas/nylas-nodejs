import { Resource } from './resource.js';
import { Overrides } from '../config.js';
import {
  NylasBaseResponse,
  NylasResponse,
  NylasListResponse,
} from '../models/response.js';
import {
  CreateGrantRequest,
  Grant,
  ListGrantsQueryParams,
  UpdateGrantRequest,
} from '../models/grants.js';

/**
 * @property grantId The id of the Grant to retrieve.
 */
interface FindGrantParams {
  grantId: string;
}

/**
 * @property requestBody The values to create the Grant with.
 */
interface CreateGrantParams {
  requestBody: CreateGrantRequest;
}

/**
 * @property grantId The id of the Grant to update.
 * @property requestBody The values to update the Grant with.
 */
interface UpdateGrantParams {
  grantId: string;
  requestBody: UpdateGrantRequest;
}

/**
 * @property grantId The id of the Grant to delete.
 */
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
   * Create a Grant via Custom Authentication
   * @return The created Grant
   */
  public create({
    requestBody,
    overrides,
  }: CreateGrantParams & Overrides): Promise<NylasResponse<Grant>> {
    return super._create({
      path: `/v3/connect/custom`,
      requestBody,
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
