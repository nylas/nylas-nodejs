import { v4 as uuid } from 'uuid';
import sha256 from 'sha256';
import APIClient from '../apiClient';
import { Resource } from './resource';
import { Grants } from './grants';
import { Providers } from './providers';
import {
  URLForAdminConsentConfig,
  URLForAuthenticationConfig,
  CodeExchangeRequest,
  ServerSideHostedAuthResponse,
  ServerSideHostedAuthRequest,
  OpenID,
  PKCEAuthURL,
  TokenExchangeRequest,
  CodeExchangeResponse,
} from '../models/auth';
import { NylasResponse } from '../models/response';

export class Auth extends Resource {
  public grants: Grants;
  public providers: Providers;

  apiClient: APIClient;
  clientId: string;
  clientSecret: string;

  constructor(apiClient: APIClient, clientId: string, clientSecret: string) {
    super(apiClient);
    this.apiClient = apiClient;
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    this.grants = new Grants(apiClient);
    this.providers = new Providers(apiClient, clientId, clientSecret);
  }

  /**
   * Exchange an authorization code for an access token
   * @param payload The request parameters for the code exchange
   * @return Information about the Nylas application
   */
  public exchangeCodeForToken(
    payload: CodeExchangeRequest
  ): Promise<CodeExchangeResponse> {
    this.checkAuthCredentials();
    const body: Record<string, unknown> = {
      code: payload.code,
      redirectUri: payload.redirectUri,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      grantType: 'authorization_code',
    };
    if (payload.codeVerifier) {
      body.codeVerifier = payload.codeVerifier;
    }
    return this.apiClient.request<CodeExchangeResponse>({
      method: 'POST',
      path: `/v3/connect/token`,
      body,
    });
  }

  /**
   * Exchange a refresh token for an access token (and if rotation enabled refresh token as well)
   * @param payload The request parameters for the token exchange
   * @return Information about the Nylas application
   */
  public refreshAccessToken(
    payload: TokenExchangeRequest
  ): Promise<CodeExchangeResponse> {
    this.checkAuthCredentials();

    return this.apiClient.request<CodeExchangeResponse>({
      method: 'POST',
      path: `/v3/connect/token`,
      body: {
        refreshToken: payload.refreshToken,
        redirectUri: payload.redirectUri,
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        grantType: 'refresh_token',
      },
    });
  }

  /**
   * Validate and retrieve information about an ID token
   * @param token The ID token
   * @return Information about the ID token
   */
  public validateIDToken(token: string): Promise<NylasResponse<OpenID>> {
    return this.validateToken({ idToken: token });
  }

  /**
   * Validate and retrieve information about an access token
   * @param token The access token
   * @return Information about the access token
   */
  public validateAccessToken(token: string): Promise<NylasResponse<OpenID>> {
    return this.validateToken({
      accessToken: token,
    });
  }

  private validateToken(
    queryParams: Record<string, string>
  ): Promise<NylasResponse<OpenID>> {
    this.checkAuthCredentials();

    return this.apiClient.request<NylasResponse<OpenID>>({
      method: 'GET',
      path: `/v3/connect/tokeninfo`,
      queryParams,
    });
  }

  /**
   * Build the URL for authenticating users to your application via Hosted Authentication
   * @param config Configuration for the authentication process
   * @return The URL for hosted authentication
   */
  public urlForAuthentication(config: URLForAuthenticationConfig): string {
    return this.urlAuthBuilder(config).toString();
  }

  private urlAuthBuilder(config: Record<string, any>): URL {
    this.checkAuthCredentials();

    const url = new URL(`${this.apiClient.serverUrl}/v3/connect/auth`);
    url.searchParams.set('client_id', this.clientId as string);
    url.searchParams.set('redirect_uri', config.redirectUri);
    url.searchParams.set(
      'access_type',
      config.accessType ? config.accessType : 'online' //TODO::More secure
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
   * Build the URL for authenticating users to your application via Hosted Authentication with PKCE
   * IMPORTANT: YOU WILL NEED TO STORE THE 'secret' returned to use it inside the CodeExchange flow
   * @param config Configuration for the authentication process
   * @return The URL for hosted authentication
   */
  public urlForAuthenticationPKCE(
    config: URLForAuthenticationConfig
  ): PKCEAuthURL {
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
  public urlForAdminConsent(config: URLForAdminConsentConfig): string {
    const configWithProvider = { ...config, provider: 'microsoft' };
    const url = this.urlAuthBuilder(configWithProvider);
    url.searchParams.set('response_type', 'adminconsent');
    url.searchParams.set('credential_id', config.credentialId);
    return url.toString();
  }

  private checkAuthCredentials(): void {
    if (!this.clientId || !this.clientSecret) {
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
  public async serverSideHostedAuth(
    payload: ServerSideHostedAuthRequest
  ): Promise<NylasResponse<ServerSideHostedAuthResponse>> {
    return await this.apiClient.request<
      NylasResponse<ServerSideHostedAuthResponse>
    >({
      method: 'POST',
      path: `/v3/connect/auth`,
      body: payload,
    });
  }

  /**
   * Revoke a single access token
   * @param accessToken The access token to revoke
   * @return True if the access token was revoked
   */
  public async revoke(accessToken: string): Promise<boolean> {
    await this.apiClient.request<undefined>({
      method: 'POST',
      path: `/v3/connect/revoke`,
      queryParams: {
        token: accessToken,
      },
    });
    return true;
  }
}
