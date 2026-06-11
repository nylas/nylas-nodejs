import { Overrides } from '../config.js';
import {
  AutoGroupWorkspacesRequest,
  AutoGroupWorkspacesResponse,
  CreateWorkspaceRequest,
  ListWorkspacesQueryParams,
  ManualAssignWorkspaceRequest,
  ManualAssignWorkspaceResponse,
  UpdateWorkspaceRequest,
  Workspace,
} from '../models/workspaces.js';
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
interface ListWorkspacesParams {
  queryParams?: ListWorkspacesQueryParams;
}

/**
 * @property workspaceId The ID of the workspace to retrieve. Accepts a UUID or a domain.
 */
interface FindWorkspaceParams {
  workspaceId: string;
}

/**
 * @property requestBody The values to create the workspace with.
 */
interface CreateWorkspaceParams {
  requestBody: CreateWorkspaceRequest;
}

/**
 * @property workspaceId The UUID of the workspace to update. A domain is not accepted here.
 * @property requestBody The values to update the workspace with.
 */
interface UpdateWorkspaceParams {
  workspaceId: string;
  requestBody: UpdateWorkspaceRequest;
}

/**
 * @property workspaceId The ID of the workspace to delete. Accepts a UUID or a domain.
 */
interface DestroyWorkspaceParams {
  workspaceId: string;
}

/**
 * @property requestBody The auto-group filters to apply.
 */
interface AutoGroupWorkspacesParams {
  requestBody?: AutoGroupWorkspacesRequest;
}

/**
 * @property workspaceId The ID of the workspace to update. Accepts a UUID or a domain.
 * @property requestBody The grants to assign and/or remove.
 */
interface ManualAssignWorkspaceParams {
  workspaceId: string;
  requestBody: ManualAssignWorkspaceRequest;
}

/**
 * Nylas Workspaces API
 *
 * Workspaces group grants in a Nylas application by email domain. Grants can be
 * auto-grouped by matching email domain or manually assigned and removed.
 */
export class Workspaces extends Resource {
  /**
   * Return all workspaces for the application.
   *
   * The list endpoint is not paginated and returns every workspace as a flat array.
   * @return The list of workspaces.
   */
  public list({
    queryParams,
    overrides,
  }: ListWorkspacesParams & Overrides = {}): AsyncListResponse<
    NylasListResponse<Workspace>
  > {
    return super._list({
      queryParams,
      path: makePathParams('/v3/workspaces', {}),
      overrides,
    });
  }

  /**
   * Return a workspace.
   * @return The workspace.
   */
  public find({
    workspaceId,
    overrides,
  }: FindWorkspaceParams & Overrides): Promise<NylasResponse<Workspace>> {
    return super._find({
      path: makePathParams('/v3/workspaces/{workspaceId}', { workspaceId }),
      overrides,
    });
  }

  /**
   * Create a workspace.
   * @return The created workspace.
   */
  public create({
    requestBody,
    overrides,
  }: CreateWorkspaceParams & Overrides): Promise<NylasResponse<Workspace>> {
    return super._create({
      path: makePathParams('/v3/workspaces', {}),
      requestBody,
      overrides,
    });
  }

  /**
   * Update a workspace.
   *
   * Issued as PATCH; the workspace must be addressed by its UUID.
   * @return The updated workspace.
   */
  public update({
    workspaceId,
    requestBody,
    overrides,
  }: UpdateWorkspaceParams & Overrides): Promise<NylasResponse<Workspace>> {
    return super._updatePatch({
      path: makePathParams('/v3/workspaces/{workspaceId}', { workspaceId }),
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a workspace.
   * @return The deletion response.
   */
  public destroy({
    workspaceId,
    overrides,
  }: DestroyWorkspaceParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: makePathParams('/v3/workspaces/{workspaceId}', { workspaceId }),
      overrides,
    });
  }

  /**
   * Start a background job that auto-groups grants into workspaces by email domain.
   * @return The auto-group job response.
   */
  public autoGroup({
    requestBody,
    overrides,
  }: AutoGroupWorkspacesParams & Overrides = {}): Promise<
    NylasResponse<AutoGroupWorkspacesResponse>
  > {
    return super._create({
      path: makePathParams('/v3/workspaces/auto-group', {}),
      requestBody: requestBody ?? {},
      overrides,
    });
  }

  /**
   * Manually assign grants to and/or remove grants from a workspace.
   * @return The assignment response.
   */
  public manualAssign({
    workspaceId,
    requestBody,
    overrides,
  }: ManualAssignWorkspaceParams & Overrides): Promise<
    NylasResponse<ManualAssignWorkspaceResponse>
  > {
    return super._create({
      path: makePathParams('/v3/workspaces/{workspaceId}/manual-assign', {
        workspaceId,
      }),
      requestBody,
      overrides,
    });
  }
}
