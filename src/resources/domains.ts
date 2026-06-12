import { Overrides, OverridableNylasConfig } from '../config.js';
import {
  CreateDomainRequest,
  Domain,
  DomainVerificationAttempt,
  DomainVerificationResult,
  ListDomainsQueryParams,
  UpdateDomainRequest,
} from '../models/domains.js';
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
interface ListDomainsParams {
  queryParams?: ListDomainsQueryParams;
}

/**
 * @property domainId The ID of the domain to retrieve. Accepts either a domain
 * UUID or a domain address (FQDN/email format).
 */
interface FindDomainParams {
  domainId: string;
}

/**
 * @property requestBody The values to create the domain with.
 */
interface CreateDomainParams {
  requestBody: CreateDomainRequest;
}

/**
 * @property domainId The ID of the domain to update. Accepts either a domain
 * UUID or a domain address (FQDN/email format).
 * @property requestBody The values to update the domain with.
 */
interface UpdateDomainParams {
  domainId: string;
  requestBody: UpdateDomainRequest;
}

/**
 * @property domainId The ID of the domain to delete. Accepts either a domain
 * UUID or a domain address (FQDN/email format).
 */
interface DestroyDomainParams {
  domainId: string;
}

/**
 * @property domainId The ID of the domain to fetch verification info for.
 * Accepts either a domain UUID or a domain address (FQDN/email format).
 * @property requestBody The verification attempt describing which DNS type to fetch info for.
 */
interface InfoDomainParams {
  domainId: string;
  requestBody: DomainVerificationAttempt;
}

/**
 * @property domainId The ID of the domain to verify. Accepts either a domain
 * UUID or a domain address (FQDN/email format).
 * @property requestBody The verification attempt describing which DNS type to verify.
 */
interface VerifyDomainParams {
  domainId: string;
  requestBody: DomainVerificationAttempt;
}

/**
 * Nylas Manage Domains API
 *
 * Register email domains and run their DNS verification flow
 * (ownership / MX / SPF / DKIM / feedback) for Transactional Send and Nylas Inbound.
 */
export class Domains extends Resource {
  private static readonly REQUIRED_SERVICE_ACCOUNT_HEADERS = [
    'x-nylas-kid',
    'x-nylas-timestamp',
    'x-nylas-nonce',
    'x-nylas-signature',
  ];

  private assertServiceAccountSigningHeaders(
    overrides?: OverridableNylasConfig
  ): void {
    const headers = {
      ...(this.apiClient.headers ?? {}),
      ...(overrides?.headers ?? {}),
    };
    const normalizedHeaders = Object.fromEntries(
      Object.entries(headers).map(([header, value]) => [
        header.toLowerCase(),
        value,
      ])
    );
    const missingHeader = Domains.REQUIRED_SERVICE_ACCOUNT_HEADERS.some(
      (header) => !normalizedHeaders[header]?.trim()
    );

    if (missingHeader) {
      throw new Error(
        'Manage Domains API requests require Nylas Service Account signing headers.'
      );
    }
  }

  /**
   * Return all domains for the caller's organization.
   *
   * Requires Nylas Service Account request signing headers:
   * X-Nylas-Kid, X-Nylas-Timestamp, X-Nylas-Nonce, and X-Nylas-Signature.
   * @return The list of domains.
   */
  public list({
    queryParams,
    overrides,
  }: ListDomainsParams & Overrides = {}): AsyncListResponse<
    NylasListResponse<Domain>
  > {
    this.assertServiceAccountSigningHeaders(overrides);
    return super._list({
      queryParams,
      path: makePathParams('/v3/admin/domains', {}),
      overrides,
    });
  }

  /**
   * Return a domain.
   *
   * Requires Nylas Service Account request signing headers:
   * X-Nylas-Kid, X-Nylas-Timestamp, X-Nylas-Nonce, and X-Nylas-Signature.
   * @return The domain.
   */
  public find({
    domainId,
    overrides,
  }: FindDomainParams & Overrides): Promise<NylasResponse<Domain>> {
    this.assertServiceAccountSigningHeaders(overrides);
    return super._find({
      path: makePathParams('/v3/admin/domains/{domainId}', { domainId }),
      overrides,
    });
  }

  /**
   * Create a domain.
   *
   * Requires Nylas Service Account request signing headers:
   * X-Nylas-Kid, X-Nylas-Timestamp, X-Nylas-Nonce, and X-Nylas-Signature.
   * @return The created domain.
   */
  public create({
    requestBody,
    overrides,
  }: CreateDomainParams & Overrides): Promise<NylasResponse<Domain>> {
    this.assertServiceAccountSigningHeaders(overrides);
    return super._create({
      path: makePathParams('/v3/admin/domains', {}),
      requestBody,
      overrides,
    });
  }

  /**
   * Update a domain.
   *
   * Note: the response echoes the sparse cleared input (typically just `name`
   * and `updatedAt`), not a full domain. Re-fetch the domain with `find` if you
   * need the complete record.
   *
   * Requires Nylas Service Account request signing headers:
   * X-Nylas-Kid, X-Nylas-Timestamp, X-Nylas-Nonce, and X-Nylas-Signature.
   * @return The updated domain fields.
   */
  public update({
    domainId,
    requestBody,
    overrides,
  }: UpdateDomainParams & Overrides): Promise<NylasResponse<Domain>> {
    this.assertServiceAccountSigningHeaders(overrides);
    return super._update({
      path: makePathParams('/v3/admin/domains/{domainId}', { domainId }),
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a domain.
   *
   * Requires Nylas Service Account request signing headers:
   * X-Nylas-Kid, X-Nylas-Timestamp, X-Nylas-Nonce, and X-Nylas-Signature.
   * @return The deletion response.
   */
  public destroy({
    domainId,
    overrides,
  }: DestroyDomainParams & Overrides): Promise<NylasBaseResponse> {
    this.assertServiceAccountSigningHeaders(overrides);
    return super._destroy({
      path: makePathParams('/v3/admin/domains/{domainId}', { domainId }),
      overrides,
    });
  }

  /**
   * Get the DNS record a customer must configure for a given verification type.
   *
   * Requires Nylas Service Account request signing headers:
   * X-Nylas-Kid, X-Nylas-Timestamp, X-Nylas-Nonce, and X-Nylas-Signature.
   * @return The verification result, including the DNS record to configure.
   */
  public info({
    domainId,
    requestBody,
    overrides,
  }: InfoDomainParams & Overrides): Promise<
    NylasResponse<DomainVerificationResult>
  > {
    this.assertServiceAccountSigningHeaders(overrides);
    return super._create({
      path: makePathParams('/v3/admin/domains/{domainId}/info', { domainId }),
      requestBody,
      overrides,
    });
  }

  /**
   * Trigger a DNS verification check for a given verification type.
   *
   * Requires Nylas Service Account request signing headers:
   * X-Nylas-Kid, X-Nylas-Timestamp, X-Nylas-Nonce, and X-Nylas-Signature.
   * @return The verification result, including the current status.
   */
  public verify({
    domainId,
    requestBody,
    overrides,
  }: VerifyDomainParams & Overrides): Promise<
    NylasResponse<DomainVerificationResult>
  > {
    this.assertServiceAccountSigningHeaders(overrides);
    return super._create({
      path: makePathParams('/v3/admin/domains/{domainId}/verify', { domainId }),
      requestBody,
      overrides,
    });
  }
}
