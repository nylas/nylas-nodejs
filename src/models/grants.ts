import { Provider } from './auth';

/**
 * Interface representing a Nylas Grant object.
 */
export interface Grant {
  /**
   * Globally unique object identifier.
   */
  id: string;
  /**
   * OAuth provider that the user authenticated with.
   */
  provider: string;
  /**
   * Scopes specified for the grant.
   */
  scope: string[];
  /**
   * Unix timestamp when the grant was created.
   */
  createdAt: number;
  /**
   * Status of the grant, if it is still valid or if the user needs to re-authenticate.
   */
  grantStatus?: string;
  /**
   * Email address associated with the grant.
   */
  email?: string;
  /**
   * End user's client user agent.
   */
  userAgent?: string;
  /**
   * End user's client IP address.
   */
  ip?: string;
  /**
   * Initial state that was sent as part of the OAuth request.
   */
  state?: string;
  /**
   * Unix timestamp when the grant was updated.
   */
  updatedAt?: number;
  /**
   * Provider's ID for the user this grant is associated with.
   */
  providerUserId?: string;
  /**
   * Settings required by the provider that were sent as part of the OAuth request.
   */
  settings?: Record<string, unknown>;
}

/**
 * Interface representing a request to create a grant.
 */
export interface CreateGrantRequest {
  /**
   * OAuth provider
   */
  provider: Provider;
  /**
   * Settings required by provider.
   */
  settings: Record<string, unknown>;
  /**
   * Optional state value to return to developer's website after authentication flow is completed.
   */
  state?: string;
  /**
   * Optional list of scopes to request. If not specified it will use the integration default scopes.
   */
  scope?: string[];
}

/**
 * Interface representing a request to update a grant.
 */
export interface UpdateGrantRequest {
  /**
   * Settings required by provider.
   */
  settings?: Record<string, unknown>;
  /**
   * List of integration scopes for the grant.
   */
  scope?: string[];
}

/**
 * Interface representing the query parameters for listing grants.
 */
export interface ListGrantsQueryParams {
  /**
   * The maximum number of objects to return.
   * This field defaults to 10. The maximum allowed value is 200.
   */
  limit?: number;
  /**
   * Offset grant results by this number.
   */
  offset?: number;
  /**
   * Sort entries by field name
   */
  sortBy?: 'createdAt' | 'updatedAt';
  /**
   * Specify ascending or descending order.
   */
  orderBy?: 'asc' | 'desc';
  /**
   * Scope grants from a specific point in time by Unix timestamp.
   */
  since?: number;
  /**
   * Scope grants to a specific point in time by Unix timestamp.
   */
  before?: number;
  /**
   * Filtering your query based on grant email address (if applicable)
   */
  email?: string;
  /**
   * Filtering your query based on grant email status (if applicable)
   */
  grantStatus?: string;
  /**
   * Filtering your query based on grant IP address
   */
  ip?: string;
  /**
   * Filtering your query based on OAuth provider
   */
  provider?: Provider;
}
