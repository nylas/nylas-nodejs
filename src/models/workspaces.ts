/**
 * Interface representing a Nylas workspace.
 *
 * A workspace groups grants in a Nylas application by email domain. Grants can be
 * auto-grouped (by matching email domain) or manually assigned and removed.
 */
export interface Workspace {
  /**
   * Globally unique identifier for the workspace.
   */
  workspaceId: string;
  /**
   * The ID of the application that owns the workspace.
   * Set server-side from the API key, never from the request body.
   */
  applicationId: string;
  /**
   * Descriptive name for the workspace.
   */
  name: string;
  /**
   * Top-level email domain for the workspace.
   * May be an empty string when created with autoGroup false and no domain.
   */
  domain: string;
  /**
   * When true, new grants whose email domain matches domain are auto-assigned.
   */
  autoGroup: boolean;
  /**
   * When true, this is the application's default workspace.
   */
  default?: boolean;
  /**
   * The ID of the inbox policy attached to the workspace.
   */
  policyId?: string;
  /**
   * The IDs of the inbox rules attached to the workspace.
   */
  ruleIds?: string[];
  /**
   * Unix timestamp (seconds) when the workspace was created.
   */
  createdAt: number;
  /**
   * Unix timestamp (seconds) when the workspace was last updated.
   */
  updatedAt: number;
}

/**
 * Interface representing a request to create a workspace.
 */
export interface CreateWorkspaceRequest {
  /**
   * Descriptive name for the workspace.
   */
  name: string;
  /**
   * Top-level email domain for the workspace.
   * Optional: when omitted along with autoGroup, an empty-domain workspace is created.
   */
  domain?: string;
  /**
   * When true, new grants whose email domain matches domain are auto-assigned.
   * Defaults server-side to true when a domain is provided, false otherwise.
   */
  autoGroup?: boolean;
  /**
   * The ID of the inbox policy to attach to the workspace.
   */
  policyId?: string;
  /**
   * The IDs of the inbox rules to attach to the workspace.
   */
  ruleIds?: string[];
}

/**
 * Interface representing a request to update a workspace.
 *
 * Updates are issued as PATCH and address the workspace by its UUID only.
 * At least one field must be provided.
 */
export interface UpdateWorkspaceRequest {
  /**
   * Descriptive name for the workspace. Omitted fields are preserved.
   */
  name?: string;
  /**
   * Top-level email domain. Changing the domain is rejected by the server;
   * the domain is effectively immutable after creation.
   */
  domain?: string;
  /**
   * When true, new grants whose email domain matches domain are auto-assigned.
   * Cannot be set to true on a workspace with an empty domain.
   */
  autoGroup?: boolean;
  /**
   * The ID of the inbox policy attached to the workspace.
   * A UUID sets the policy, null clears it, and omitting preserves the current value.
   */
  policyId?: string | null;
  /**
   * The IDs of the inbox rules attached to the workspace.
   * An array (including an empty array) overwrites; null or omitting preserves.
   */
  ruleIds?: string[] | null;
}

/**
 * Interface representing query parameters for listing workspaces.
 *
 * The list endpoint is not paginated and accepts no query parameters.
 */
export type ListWorkspacesQueryParams = Record<string, never>;

/**
 * Interface representing a request to auto-group grants into workspaces.
 *
 * All fields are optional. Auto-grouping runs as a background job.
 */
export interface AutoGroupWorkspacesRequest {
  /**
   * Only group grants created at or after this Unix timestamp (seconds).
   */
  afterCreatedAt?: number;
  /**
   * When true, includes invalid grants in the grouping pass. Defaults to false.
   */
  invalidAlso?: boolean;
  /**
   * Only group grants whose email domain matches this domain.
   */
  specificDomain?: string;
}

/**
 * Interface representing the response from starting an auto-group job.
 */
export interface AutoGroupWorkspacesResponse {
  /**
   * The ID of the background auto-group job.
   */
  jobId: string;
  /**
   * A human-readable message describing the started job.
   */
  message: string;
}

/**
 * Interface representing a request to manually assign or remove grants
 * for a workspace.
 *
 * At least one of assignGrants or removeGrants must contain a grant ID.
 * Each list may contain at most 500 entries.
 */
export interface ManualAssignWorkspaceRequest {
  /**
   * Grant IDs to assign to the workspace. Maximum 500 entries.
   */
  assignGrants?: string[];
  /**
   * Grant IDs to remove from the workspace. Maximum 500 entries.
   */
  removeGrants?: string[];
}

/**
 * Interface representing the response from manually assigning or removing grants.
 */
export interface ManualAssignWorkspaceResponse {
  /**
   * The ID of the application that owns the workspace.
   */
  applicationId: string;
  /**
   * The ID of the workspace that was updated.
   */
  workspaceId: string;
  /**
   * The domain of the workspace (empty string if none).
   */
  domain: string;
  /**
   * The grant IDs that were actually assigned.
   * Serializes as null (not an empty array) when no assigned grant matched.
   */
  grantsAssigned: string[] | null;
  /**
   * The grant IDs that were actually removed.
   * Serializes as null (not an empty array) when no removed grant matched.
   */
  grantsRemoved: string[] | null;
}
