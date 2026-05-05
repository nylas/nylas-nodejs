import { Overrides } from '../config.js';
import {
  CreatePolicyRequest,
  ListPoliciesQueryParams,
  Policy,
  UpdatePolicyRequest,
} from '../models/policies.js';
import {
  NylasBaseResponse,
  NylasListResponse,
  NylasResponse,
} from '../models/response.js';
import { makePathParams } from '../utils.js';
import { AsyncListResponse, Resource } from './resource.js';

/**
 * @property queryParams The query parameters to include in the request.
 */
interface ListPoliciesParams {
  queryParams?: ListPoliciesQueryParams;
}

/**
 * @property policyId The ID of the policy to retrieve.
 */
interface FindPolicyParams {
  policyId: string;
}

/**
 * @property requestBody The values to create the policy with.
 */
interface CreatePolicyParams {
  requestBody: CreatePolicyRequest;
}

/**
 * @property policyId The ID of the policy to update.
 * @property requestBody The values to update the policy with.
 */
interface UpdatePolicyParams {
  policyId: string;
  requestBody: UpdatePolicyRequest;
}

/**
 * @property policyId The ID of the policy to delete.
 */
interface DestroyPolicyParams {
  policyId: string;
}

/**
 * Nylas Agent Account Policies API
 *
 * Policies define limits, spam settings, options, and linked rules for Agent Accounts.
 */
export class Policies extends Resource {
  /**
   * Return all policies.
   * @return The list of policies.
   */
  public list({
    queryParams,
    overrides,
  }: ListPoliciesParams & Overrides = {}): AsyncListResponse<
    NylasListResponse<Policy>
  > {
    return super._list({
      queryParams,
      path: makePathParams('/v3/policies', {}),
      overrides,
    });
  }

  /**
   * Return a policy.
   * @return The policy.
   */
  public find({
    policyId,
    overrides,
  }: FindPolicyParams & Overrides): Promise<NylasResponse<Policy>> {
    return super._find({
      path: makePathParams('/v3/policies/{policyId}', { policyId }),
      overrides,
    });
  }

  /**
   * Create a policy.
   * @return The created policy.
   */
  public create({
    requestBody,
    overrides,
  }: CreatePolicyParams & Overrides): Promise<NylasResponse<Policy>> {
    return super._create({
      path: makePathParams('/v3/policies', {}),
      requestBody,
      overrides,
    });
  }

  /**
   * Update a policy.
   * @return The updated policy.
   */
  public update({
    policyId,
    requestBody,
    overrides,
  }: UpdatePolicyParams & Overrides): Promise<NylasResponse<Policy>> {
    return super._update({
      path: makePathParams('/v3/policies/{policyId}', { policyId }),
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a policy.
   * @return The deletion response.
   */
  public destroy({
    policyId,
    overrides,
  }: DestroyPolicyParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: makePathParams('/v3/policies/{policyId}', { policyId }),
      overrides,
    });
  }
}
