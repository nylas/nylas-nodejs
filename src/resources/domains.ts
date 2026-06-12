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
import {
  canonicalJson,
  ServiceAccountSigner,
} from '../models/serviceAccount.js';
import { makePathParams, objKeysToSnakeCase } from '../utils.js';
import { AsyncListResponse, Resource } from './resource.js';

/**
 * @property queryParams The query parameters to include in the request.
 */
interface ListDomainsParams {
  queryParams?: ListDomainsQueryParams;
  signer?: ServiceAccountSigner;
}

/**
 * @property domainId The ID of the domain to retrieve. Accepts either a domain
 * UUID or a domain address (FQDN/email format).
 */
interface FindDomainParams {
  domainId: string;
  signer?: ServiceAccountSigner;
}

/**
 * @property requestBody The values to create the domain with.
 */
interface CreateDomainParams {
  requestBody: CreateDomainRequest;
  signer?: ServiceAccountSigner;
}

/**
 * @property domainId The ID of the domain to update. Accepts either a domain
 * UUID or a domain address (FQDN/email format).
 * @property requestBody The values to update the domain with.
 */
interface UpdateDomainParams {
  domainId: string;
  requestBody: UpdateDomainRequest;
  signer?: ServiceAccountSigner;
}

/**
 * @property domainId The ID of the domain to delete. Accepts either a domain
 * UUID or a domain address (FQDN/email format).
 */
interface DestroyDomainParams {
  domainId: string;
  signer?: ServiceAccountSigner;
}

/**
 * @property domainId The ID of the domain to fetch verification info for.
 * Accepts either a domain UUID or a domain address (FQDN/email format).
 * @property requestBody The verification attempt describing which DNS type to fetch info for.
 */
interface InfoDomainParams {
  domainId: string;
  requestBody: DomainVerificationAttempt;
  signer?: ServiceAccountSigner;
}

/**
 * @property domainId The ID of the domain to verify. Accepts either a domain
 * UUID or a domain address (FQDN/email format).
 * @property requestBody The verification attempt describing which DNS type to verify.
 */
interface VerifyDomainParams {
  domainId: string;
  requestBody: DomainVerificationAttempt;
  signer?: ServiceAccountSigner;
}

interface SignedRequestParams {
  method: string;
  path: string;
  requestBody?: Record<string, any>;
  signer?: ServiceAccountSigner;
  overrides?: OverridableNylasConfig;
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

  private buildSignedRequest({
    method,
    path,
    requestBody,
    signer,
    overrides,
  }: SignedRequestParams): {
    overrides?: OverridableNylasConfig;
    serializedBody?: string;
  } {
    if (!signer) {
      this.assertServiceAccountSigningHeaders(overrides);
      const body = requestBody ? objKeysToSnakeCase(requestBody) : undefined;
      return {
        overrides: { ...overrides, skipAuth: true },
        serializedBody: body ? canonicalJson(body) : undefined,
      };
    }

    const body = requestBody ? objKeysToSnakeCase(requestBody) : undefined;
    const signedRequest = signer.buildHeaders({ method, path, body });
    const signedOverrides = {
      ...overrides,
      skipAuth: true,
      headers: {
        ...(overrides?.headers ?? {}),
        ...signedRequest.headers,
      },
    };

    this.assertServiceAccountSigningHeaders(signedOverrides);
    return {
      overrides: signedOverrides,
      serializedBody: signedRequest.serializedBody,
    };
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
    signer,
    overrides,
  }: ListDomainsParams & Overrides = {}): AsyncListResponse<
    NylasListResponse<Domain>
  > {
    const path = makePathParams('/v3/admin/domains', {});
    if (signer) {
      return super._list({
        queryParams,
        path,
        getOverrides: () =>
          this.buildSignedRequest({
            method: 'GET',
            path,
            signer,
            overrides,
          }).overrides,
      });
    }

    const signed = this.buildSignedRequest({
      method: 'GET',
      path,
      overrides,
    });
    return super._list({
      queryParams,
      path,
      overrides: signed.overrides,
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
    signer,
    overrides,
  }: FindDomainParams & Overrides): Promise<NylasResponse<Domain>> {
    const path = makePathParams('/v3/admin/domains/{domainId}', { domainId });
    const signed = this.buildSignedRequest({
      method: 'GET',
      path,
      signer,
      overrides,
    });
    return super._find({
      path,
      overrides: signed.overrides,
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
    signer,
    overrides,
  }: CreateDomainParams & Overrides): Promise<NylasResponse<Domain>> {
    const path = makePathParams('/v3/admin/domains', {});
    const signed = this.buildSignedRequest({
      method: 'POST',
      path,
      requestBody,
      signer,
      overrides,
    });
    return super._create({
      path,
      requestBody,
      serializedBody: signed.serializedBody,
      overrides: signed.overrides,
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
    signer,
    overrides,
  }: UpdateDomainParams & Overrides): Promise<NylasResponse<Domain>> {
    const path = makePathParams('/v3/admin/domains/{domainId}', { domainId });
    const signed = this.buildSignedRequest({
      method: 'PUT',
      path,
      requestBody,
      signer,
      overrides,
    });
    return super._update({
      path,
      requestBody,
      serializedBody: signed.serializedBody,
      overrides: signed.overrides,
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
    signer,
    overrides,
  }: DestroyDomainParams & Overrides): Promise<NylasBaseResponse> {
    const path = makePathParams('/v3/admin/domains/{domainId}', { domainId });
    const signed = this.buildSignedRequest({
      method: 'DELETE',
      path,
      signer,
      overrides,
    });
    return super._destroy({
      path,
      overrides: signed.overrides,
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
    signer,
    overrides,
  }: InfoDomainParams & Overrides): Promise<
    NylasResponse<DomainVerificationResult>
  > {
    const path = makePathParams('/v3/admin/domains/{domainId}/info', {
      domainId,
    });
    const signed = this.buildSignedRequest({
      method: 'POST',
      path,
      requestBody,
      signer,
      overrides,
    });
    return super._create({
      path,
      requestBody,
      serializedBody: signed.serializedBody,
      overrides: signed.overrides,
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
    signer,
    overrides,
  }: VerifyDomainParams & Overrides): Promise<
    NylasResponse<DomainVerificationResult>
  > {
    const path = makePathParams('/v3/admin/domains/{domainId}/verify', {
      domainId,
    });
    const signed = this.buildSignedRequest({
      method: 'POST',
      path,
      requestBody,
      signer,
      overrides,
    });
    return super._create({
      path,
      requestBody,
      serializedBody: signed.serializedBody,
      overrides: signed.overrides,
    });
  }
}
