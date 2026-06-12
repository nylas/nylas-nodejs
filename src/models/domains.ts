import { ListQueryParams } from './listQueryParams.js';

/**
 * Type for the DNS verification types supported by the Manage Domains API.
 */
export type DomainVerificationType =
  | 'ownership'
  | 'mx'
  | 'spf'
  | 'dkim'
  | 'feedback'
  | 'dmarc'
  | 'arc';

/**
 * Type for the DNS verification types accepted by Manage Domains info and
 * verify request bodies.
 */
export type DomainVerificationRequestType =
  | 'ownership'
  | 'mx'
  | 'spf'
  | 'dkim'
  | 'feedback';

/**
 * Type for the status of a domain DNS verification attempt.
 */
export type DomainVerificationStatus = 'pending' | 'done' | 'failed';

/**
 * Interface representing a registered email domain.
 *
 * Every field is optional: the API only emits fields it has populated.
 */
export interface Domain {
  /**
   * Server-generated domain ID.
   */
  id?: string;
  /**
   * Human-readable label.
   */
  name?: string;
  /**
   * The registered domain (for example, mail.example.com). Stored lowercased.
   */
  domainAddress?: string;
  /**
   * The ID of the organization that owns the domain. Derived from auth, never client-set.
   */
  organizationId?: string;
  /**
   * Whether the domain is a subdomain of a Nylas branded domain. Server-determined at create.
   */
  branded?: boolean;
  /**
   * Cluster region. Server-set from config at create.
   */
  region?: string;
  /**
   * Ownership (TXT) verification flag.
   */
  verifiedOwnership?: boolean;
  /**
   * MX verification flag.
   */
  verifiedMx?: boolean;
  /**
   * SPF verification flag.
   */
  verifiedSpf?: boolean;
  /**
   * Feedback MX verification flag.
   */
  verifiedFeedback?: boolean;
  /**
   * DKIM verification flag.
   */
  verifiedDkim?: boolean;
  /**
   * DMARC verification flag.
   */
  verifiedDmarc?: boolean;
  /**
   * ARC verification flag.
   */
  verifiedArc?: boolean;
  /**
   * Unix timestamp when the domain was created.
   */
  createdAt?: number;
  /**
   * Unix timestamp when the domain was last updated.
   */
  updatedAt?: number;
}

/**
 * Interface representing a request to create a domain.
 *
 * Other Domain fields are not honored for create: the server sets region,
 * branded, the verified flags, id, and timestamps.
 */
export interface CreateDomainRequest {
  /**
   * Human-readable label.
   */
  name: string;
  /**
   * The domain to register. Normalized to lowercase. Cannot duplicate an existing
   * domain in the organization.
   */
  domainAddress: string;
}

/**
 * Interface representing a request to update a domain.
 *
 * Only `name` is updatable. `domainAddress` cannot be changed after create;
 * delete and recreate the domain to use a different address.
 */
export interface UpdateDomainRequest {
  /**
   * New human-readable label.
   */
  name?: string;
}

/**
 * Interface representing a domain DNS verification attempt, used as the request
 * body for both the Info and Verify endpoints.
 */
export interface DomainVerificationAttempt {
  /**
   * The DNS verification type to fetch info for or verify.
   */
  type: DomainVerificationRequestType;
  /**
   * Free-form options. For dkim, may carry a key-length hint. Most callers omit this.
   */
  options?: Record<string, any>;
}

/**
 * Interface representing the DNS record details for a verification attempt
 * returned in a verification result.
 */
export interface DomainVerificationAttemptResult {
  /**
   * The verification type that this attempt corresponds to.
   */
  type?: DomainVerificationType;
  /**
   * The DNS record values to configure (for example, host, type, and value).
   */
  options?: Record<string, any>;
}

/**
 * Interface representing the result of a domain Info or Verify request.
 *
 * Info and Verify return the same shape. Every field is optional.
 */
export interface DomainVerificationResult {
  /**
   * The ID of the domain being verified.
   */
  domainId?: string;
  /**
   * The verification attempt, including the DNS record to configure.
   */
  attempt?: DomainVerificationAttemptResult;
  /**
   * The current status for this verification type.
   */
  status?: DomainVerificationStatus;
  /**
   * Unix timestamp when the attempt record was created.
   */
  createdAt?: number;
  /**
   * Unix timestamp when the temporary attempt expires.
   */
  expiresAt?: number;
  /**
   * Optional in-between state.
   */
  details?: Record<string, any>;
  /**
   * Human-readable instruction for configuring the DNS record.
   */
  message?: string;
}

/**
 * Interface representing query parameters for listing domains.
 */
export interface ListDomainsQueryParams extends ListQueryParams {
  /**
   * Filter by exact domain address. Note the key is `domain`, not `domainAddress`.
   */
  domain?: string;
  /**
   * Filter by region.
   */
  region?: string;
}
