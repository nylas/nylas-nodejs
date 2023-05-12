import { v4 as uuid } from 'uuid';
import sha256 from 'sha256';
import APIClient from '../apiClient';
import { BaseResource } from './baseResource';
import { Grants } from './grants';
import { Providers } from './providers';
import {
  AdminConsentAuth,
  AuthConfig,
  CodeExchangeRequest,
  HostedAuth,
  HostedAuthRequest,
  HostedAuthResponseSchema,
  IMAPAuthConfig,
  OpenID,
  OpenIDSchema,
  PKCEAuthURL,
  TokenExchangeRequest,
} from '../schema/auth';
import {
  EmptyResponse,
  EmptyResponseSchema,
  ExchangeResponse,
  ExchangeResponseSchema,
  ItemResponse,
} from '../schema/response';

export class Auth extends BaseResource {
  public grants: Grants;
  public providers: Providers;

  apiClient: APIClient;

  constructor(apiClient: APIClient) {
    super(apiClient);
    this.apiClient = apiClient;

    this.grants = new Grants(apiClient);
    this.providers = new Providers(apiClient);
  }

  /**
   * Exchange an authorization code for an access token
   * @param payload The request parameters for the code exchange
   * @return Information about the Nylas application
   */
  public exchangeCodeForToken(
    payload: CodeExchangeRequest
  ): Promise<ExchangeResponse> {
    this.checkAuthCredentials();
    const body: Record<string, unknown> = {
      code: payload.code,
      redirectUri: payload.redirectUri,
      clientId: this.apiClient.clientId,
      clientSecret: this.apiClient.clientSecret,
      grantType: 'authorization_code',
    };
    if (payload.codeVerifier) {
      body.codeVerifier = payload.codeVerifier;
    }
    return this.apiClient.request<ExchangeResponse>(
      {
        method: 'POST',
        path: `/v3/connect/token`,
        body,
      },
      {
        responseSchema: ExchangeResponseSchema,
      }
    );
  }

  /**
   * Exchange a refresh token for an access token (and if rotation enabled refresh token as well)
   * @param payload The request parameters for the token exchange
   * @return Information about the Nylas application
   */
  public refreshAccessToken(
    payload: TokenExchangeRequest
  ): Promise<ExchangeResponse> {
    this.checkAuthCredentials();

    return this.apiClient.request<ExchangeResponse>(
      {
        method: 'POST',
        path: `/v3/connect/token`,
        body: {
          refreshToken: payload.refreshToken,
          redirectUri: payload.redirectUri,
          clientId: this.apiClient.clientId,
          clientSecret: this.apiClient.clientSecret,
          grantType: 'refresh_token',
        },
      },
      {
        responseSchema: ExchangeResponseSchema,
      }
    );
  }

  /**
   * Validate and retrieve information about an ID token
   * @param token The ID token
   * @return Information about the ID token
   */
  public validateIDToken(token: string): Promise<OpenID> {
    return this.validateToken({ idToken: token });
  }

  /**
   * Validate and retrieve information about an access token
   * @param token The access token
   * @return Information about the access token
   */
  public validateAccessToken(token: string): Promise<OpenID> {
    return this.validateToken({
      accessToken: token,
    });
  }

  private validateToken(queryParams: Record<string, string>): Promise<OpenID> {
    this.checkAuthCredentials();

    return this.apiClient.request<OpenID>(
      {
        method: 'GET',
        path: `/v3/connect/tokeninfo`,
        queryParams,
      },
      {
        responseSchema: OpenIDSchema,
      }
    );
  }

  /**
   * Build the URL for authenticating users to your application via Hosted Authentication
   * @param config Configuration for the authentication process
   * @return The URL for hosted authentication
   */
  public urlForAuthentication(config: AuthConfig): string {
    return this.urlAuthBuilder(config).toString();
  }

  private urlAuthBuilder(config: Record<string, any>): URL {
    this.checkAuthCredentials();

    const url = new URL(`${this.apiClient.serverUrl}/v3/connect/auth`);
    url.searchParams.set('client_id', this.apiClient.clientId as string);
    url.searchParams.set('redirect_uri', config.redirectUri);
    url.searchParams.set(
      'access_type',
      config.accessType ? config.accessType : 'offline'
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
    if (config.metadata) {
      url.searchParams.set('metadata', config.metadata);
    }
    if (config.state) {
      url.searchParams.set('state', config.state);
    }

    return url;
  }
  /**
   * Build the URL for authenticating users to your application via Hosted Authentication for IMAP providers
   * @param config Configuration for the authentication process
   * @return The URL for hosted authentication IMAP
   */
  public urlForAuthenticationIMAP(config: IMAPAuthConfig): string {
    this.checkAuthCredentials();

    const url = this.urlAuthBuilder(config);
    url.searchParams.set('provider', 'imap');
    return url.toString();
  }

  /**
   * Build the URL for authenticating users to your application via Hosted Authentication with PKCE
   * IMPORTANT: YOU WILL NEED TO STORE THE 'secret' returned to use it inside the CodeExchange flow
   * @param config Configuration for the authentication process
   * @return The URL for hosted authentication
   */
  public urlForAuthenticationPKCE(config: AuthConfig): PKCEAuthURL {
    const url = this.urlAuthBuilder(config);

    // Add code challenge to URL generation
    url.searchParams.set('code_challenge_method', 's256');
    const secret = uuid();
    const secretHash = this.hashPKCESecret(secret);
    url.searchParams.set('code_challenge', secret);
    // Return the url with secret & hashed secret
    return { secret, secretHash, url: url.toString() };
  }

  private hashPKCESecret(secret: string): string {
    return Buffer.from(sha256(secret)).toString('base64');
  }

  /**
   * Build the URL for admin consent authentication for Microsoft
   * @param config Configuration for the authentication process
   * @return The URL for hosted authentication
   */
  public urlForAdminConsent(config: AdminConsentAuth): string {
    const configWithProvider = { ...config, provider: 'microsoft' };
    const url = this.urlAuthBuilder(configWithProvider);
    url.searchParams.set('response_type', 'adminconsent');
    url.searchParams.set('credential_id', config.credentialId);
    return url.toString();
  }

  private checkAuthCredentials(): void {
    if (!this.apiClient.clientId || !this.apiClient.clientSecret) {
      throw new Error('ClientID & ClientSecret are required for using auth');
    }
  }

  /**
   * Create a new authorization request and get a new unique login url.
   * Used only for hosted authentication.
   * This is the initial step requested from the server side to issue a new login url.
   * @param payload params to initiate hosted auth request
   * @return True if the request was successful
   */
  public async hostedAuth(
    payload: HostedAuthRequest
  ): Promise<ItemResponse<HostedAuth>> {
    this.checkAuthCredentials();
    const credentials = `${this.apiClient.clientId}:${this.apiClient.clientSecret}`;
    const buff = Buffer.from(credentials);

    return await this.apiClient.request<ItemResponse<HostedAuth>>(
      {
        method: 'POST',
        path: `/v3/connect/auth`,
        headers: {
          Authorization: `Basic ${buff.toString('base64')}`,
        },
        body: payload,
      },
      {
        responseSchema: HostedAuthResponseSchema,
      }
    );
  }

  /**
   * Revoke a single access token
   * @param accessToken The access token to revoke
   * @return True if the access token was revoked
   */
  public async revoke(accessToken: string): Promise<boolean> {
    await this.apiClient.request<EmptyResponse>(
      {
        method: 'POST',
        path: `/v3/connect/revoke`,
        queryParams: {
          token: accessToken,
        },
      },
      {
        responseSchema: EmptyResponseSchema,
      }
    );
    return true;
  }
}
