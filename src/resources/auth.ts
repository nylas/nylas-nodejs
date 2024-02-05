import { v4 as uuid } from 'uuid';
import { createHash } from 'node:crypto';
import { Resource } from './resource.js';
import {
  URLForAdminConsentConfig,
  URLForAuthenticationConfig,
  CodeExchangeRequest,
  PKCEAuthURL,
  TokenExchangeRequest,
  CodeExchangeResponse,
  ProviderDetectParams,
  ProviderDetectResponse,
} from '../models/auth.js';
import { Overrides } from '../config.js';
import { NylasResponse } from '../models/response.js';
import { CreateGrantRequest, Grant } from '../models/grants.js';

/**
 * @property requestBody The values to create the Grant with.
 */
interface CreateGrantParams {
  requestBody: CreateGrantRequest;
}

/**
 * A collection of authentication related API endpoints
 *
 * These endpoints allow for various functionality related to authentication.
 * Also contains the Grants API and collection of provider API endpoints.
 */
export class Auth extends Resource {
  /**
   * Build the URL for authenticating users to your application with OAuth 2.0
   * @param config The configuration for building the URL
   * @return The URL for hosted authentication
   */
  public urlForOAuth2(config: URLForAuthenticationConfig): string {
    return this.urlAuthBuilder(config).toString();
  }

  /**
   * Exchange an authorization code for an access token
   * @param request The request parameters for the code exchange
   * @return Information about the Nylas application
   */
  public exchangeCodeForToken(
    request: CodeExchangeRequest
  ): Promise<CodeExchangeResponse> {
    if (!request.clientSecret) {
      request.clientSecret = this.apiClient.apiKey;
    }

    return this.apiClient.request<CodeExchangeResponse>({
      method: 'POST',
      path: `/v3/connect/token`,
      body: {
        ...request,
        grantType: 'authorization_code',
      },
    });
  }

  /**
   * Refresh an access token
   * @param request The refresh token request
   * @return The response containing the new access token
   */
  public refreshAccessToken(
    request: TokenExchangeRequest
  ): Promise<CodeExchangeResponse> {
    if (!request.clientSecret) {
      request.clientSecret = this.apiClient.apiKey;
    }

    return this.apiClient.request<CodeExchangeResponse>({
      method: 'POST',
      path: `/v3/connect/token`,
      body: {
        ...request,
        grantType: 'refresh_token',
      },
    });
  }

  /**
   * Build the URL for authenticating users to your application with OAuth 2.0 and PKCE
   * IMPORTANT: YOU WILL NEED TO STORE THE 'secret' returned to use it inside the CodeExchange flow
   * @param config The configuration for building the URL
   * @return The URL for hosted authentication
   */
  public urlForOAuth2PKCE(config: URLForAuthenticationConfig): PKCEAuthURL {
    const url = this.urlAuthBuilder(config);

    // Add code challenge to URL generation
    url.searchParams.set('code_challenge_method', 's256');
    const secret = uuid();
    const secretHash = this.hashPKCESecret(secret);
    url.searchParams.set('code_challenge', secretHash);
    // Return the url with secret & hashed secret
    return { secret, secretHash, url: url.toString() };
  }

  /**
   * Build the URL for admin consent authentication for Microsoft
   * @param config The configuration for building the URL
   * @return The URL for admin consent authentication
   */
  public urlForAdminConsent(config: URLForAdminConsentConfig): string {
    const configWithProvider = { ...config, provider: 'microsoft' };
    const url = this.urlAuthBuilder(configWithProvider);
    url.searchParams.set('response_type', 'adminconsent');
    url.searchParams.set('credential_id', config.credentialId);
    return url.toString();
  }

  /**
   * Create a grant via Custom Authentication
   * @return The created grant
   */
  public customAuthentication({
    requestBody,
    overrides,
  }: CreateGrantParams & Overrides): Promise<NylasResponse<Grant>> {
    return this.apiClient.request<NylasResponse<Grant>>({
      method: 'POST',
      path: `/v3/connect/custom`,
      body: requestBody,
      overrides,
    });
  }

  /**
   * Revoke a token (and the grant attached to the token)
   * @param token The token to revoke
   * @return True if the token was revoked successfully
   */
  public async revoke(token: string): Promise<boolean> {
    await this.apiClient.request<undefined>({
      method: 'POST',
      path: `/v3/connect/revoke`,
      queryParams: {
        token,
      },
    });

    return true;
  }

  /**
   * Detect provider from email address
   * @param params The parameters to include in the request
   * @return The detected provider, if found
   */
  public async detectProvider(
    params: ProviderDetectParams
  ): Promise<NylasResponse<ProviderDetectResponse>> {
    return this.apiClient.request<NylasResponse<ProviderDetectResponse>>({
      method: 'POST',
      path: `/v3/providers/detect`,
      queryParams: params,
    });
  }

  private urlAuthBuilder(config: Record<string, any>): URL {
    const url = new URL(`${this.apiClient.serverUrl}/v3/connect/auth`);
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('redirect_uri', config.redirectUri);
    url.searchParams.set(
      'access_type',
      config.accessType ? config.accessType : 'online'
    );
    url.searchParams.set('response_type', 'code');
    if (config.provider) {
      url.searchParams.set('provider', config.provider);
    }
    if (config.loginHint) {
      url.searchParams.set('login_hint', config.loginHint);
      if (config.includeGrantScopes) {
        url.searchParams.set(
          'include_grant_scopes',
          config.includeGrantScopes.toString()
        );
      }
    }
    if (config.scope) {
      url.searchParams.set('scope', config.scope.join(' '));
    }
    if (config.prompt) {
      url.searchParams.set('prompt', config.prompt);
    }
    if (config.state) {
      url.searchParams.set('state', config.state);
    }

    return url;
  }

  private hashPKCESecret(secret: string): string {
    const hash = createHash('sha256')
      .update(secret)
      .digest('hex');

    return Buffer.from(hash)
      .toString('base64')
      .replace(/=+$/, '');
  }
}
