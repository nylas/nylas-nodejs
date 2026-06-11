import { ListQueryParams } from './listQueryParams.js';

/**
 * Type for the DNS verification types supported by the Manage Domains API.
 *
 * Note: the published contract only documents the first five, but the
 * service source also accepts `dmarc` and `arc`.
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
   * SES tenant key. Set during provisioning.
   */
  tenantKey?: string;
  /**
   * BYODKIM public key.
   */
  dkimPublicKey?: string;
  /**
   * Unix timestamp when the DKIM key was submitted to the provider.
   *
   * Not returned by Get or List; only populated in the Create response during
   * branded provisioning. Treat as optional and do not depend on it from Get/List.
   */
  dkimSubmittedAt?: number;
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
 * branded, the verified flags, id, timestamps, and (for branded) the
 * tenant_key/dkim_public_key/dkim_submitted_at.
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
 * Only non-null fields are persisted. `domainAddress` cannot be updated and is
 * rejected with a 400 if supplied. The update response echoes the sparse
 * cleared input (typically just `name` and `updatedAt`), not a full Domain;
 * re-fetch the domain if you need the complete record.
 */
export interface UpdateDomainRequest {
  /**
   * New human-readable label.
   */
  name?: string;
  /**
   * New cluster region.
   */
  region?: string;
  /**
   * New SES tenant key.
   */
  tenantKey?: string;
  /**
   * New BYODKIM public key.
   */
  dkimPublicKey?: string;
  /**
   * Unix timestamp when the DKIM key was submitted to the provider.
   */
  dkimSubmittedAt?: number;
  /**
   * Feedback MX verification flag. This is the only verified flag that can be
   * set directly, without running a DNS verification.
   */
  verifiedFeedback?: boolean;
}

/**
 * Interface representing a domain DNS verification attempt, used as the request
 * body for both the Info and Verify endpoints.
 */
export interface DomainVerificationAttempt {
  /**
   * The DNS verification type to fetch info for or verify.
   */
  type: DomainVerificationType;
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
