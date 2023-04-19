import {v4 as uuid} from 'uuid'
import sha256 from 'sha256'
import APIClient from '../apiClient';
import { BaseResource } from './baseResource';
import { Grants } from './grants';
import {
  OpenID,
  OpenIDResponseSchema,
  AuthConfig,
  AdminConsentAuth,
  CodeExchangeRequest,
  TokenExchangeRequest,
  PKCEAuthURL
} from '../schema/auth';
import {
  ItemResponse,
  ExchangeResponse,
  ExchangeResponseSchema,
  EmptyResponse,
  EmptyResponseSchema,
} from '../schema/response';

export class Auth extends BaseResource {
  public grants: Grants;

  apiClient: APIClient;

  constructor(apiClient: APIClient) {
    super(apiClient);
    this.apiClient = apiClient;

    this.grants = new Grants(apiClient);
  }

  /**
   * Exchange an authorization code for an access token
   * @param CodeExchangeRequest
   * @return Information about the Nylas application
   */
  public async exchangeCodeForToken(
    payload: CodeExchangeRequest
  ): Promise<ExchangeResponse> {
    this.checkAuthCredentials();
    const body: any = {
      code: payload.code,
      redirectUri: payload.redirectUri,
      clientId: this.apiClient.clientId,
      clientSecret: this.apiClient.clientSecret,
      grantType: 'authorization_code',
    }
    if (payload.codeVerifier){
      body.codeVerifier = payload.codeVerifier
    }
    const res = await this.apiClient.request<ExchangeResponse>(
      {
        method: 'POST',
        path: `/v3/connect/token`,
        body,
      },
      {
        responseSchema: ExchangeResponseSchema,
      }
    );

    return res;
  }

  /**
   * Exchange a refresh token for an access token (and if rotation enabled refresh token as well)
   * @param TokenExchangeRequest
   * @return Information about the Nylas application
   */
  public async exchangeToken(
    payload: TokenExchangeRequest
  ): Promise<ExchangeResponse> {
    this.checkAuthCredentials();

    const res = await this.apiClient.request<ExchangeResponse>(
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

    return res;
  }

  /**
   * Exchange a refresh token for an access token (and if rotation enabled refresh token as well)
   * @param TokenExchangeRequest
   * @return Information about the Nylas application
   */
  public validateIDToken(
    token: string
  ): Promise<ItemResponse<OpenID>> {
    this.checkAuthCredentials();

    return this.apiClient.request<ItemResponse<OpenID>>(
      {
        method: 'GET',
        path: `/v3/connect/tokeninfo`,
        queryParams: {
          id_token: token
        },
      },
      {
        responseSchema: OpenIDResponseSchema,
      }
    );

  }

  /**
   * Exchange a refresh token for an access token (and if rotation enabled refresh token as well)
   * @param TokenExchangeRequest
   * @return Information about the Nylas application
   */
  public async validateAccessToken(
    token: string
    ): Promise<ItemResponse<OpenID>> {
      this.checkAuthCredentials();
  
      return this.apiClient.request<ItemResponse<OpenID>>(
        {
          method: 'GET',
          path: `/v3/connect/tokeninfo`,
          queryParams: {
            access_token: token
          },
        },
        {
          responseSchema: OpenIDResponseSchema,
        }
      );
  
    }

  /**
   * Build the URL for authenticating users to your application via Hosted Authentication
   * @param AuthConfig Configuration for the authentication process
   * @return The URL for hosted authentication
   */
  public urlForAuthentication(config: AuthConfig): string {
    this.checkAuthCredentials();

    let url = `${this.apiClient.serverUrl}v3/connect/auth?client_id=${
      this.apiClient.clientId
    }&redirect_uri=${config.redirectUri}&access_type=${
      config.accessType ? config.accessType : 'offline'
    }&response_type=code`;
    if (config.provider) {
      url += `&provider=${config.provider}`;
    }
    if (config.loginHint) {
      url += `&login_hint=${config.loginHint}`;
      if (config.includeGrantScopes) {
        url += `&include_grant_scopes=${config.includeGrantScopes}`;
      }
    }
    if (config.scope) {
      url += `&scope=${config.scope.join(' ')}`;
    }
    if (config.prompt) {
      url += `&prompt=${config.prompt}`;
    }
    if (config.metadata) {
      url += `&metadata=${config.metadata}`;
    }
    if (config.state) {
      url += `&state=${config.state}`;
    }
    return url;
  }

  /**
   * Build the URL for authenticating users to your application via Hosted Authentication with PKCE
   * IMPORTANT: YOU WILL NEED TO STORE THE 'secret' returned to use it inside the CodeExchange flow
   * @param AuthConfig Configuration for the authentication process
   * @return The URL for hosted authentication
   */
  public urlForAuthenticationPKCE(config: AuthConfig): PKCEAuthURL {
    this.checkAuthCredentials();

    let url = `${this.apiClient.serverUrl}v3/connect/auth?client_id=${
      this.apiClient.clientId
    }&redirect_uri=${config.redirectUri}&access_type=${
      config.accessType ? config.accessType : 'offline'
    }&response_type=code`;
    if (config.provider) {
      url += `&provider=${config.provider}`;
    }
    if (config.loginHint) {
      url += `&login_hint=${config.loginHint}`;
      if (config.includeGrantScopes) {
        url += `&include_grant_scopes=${config.includeGrantScopes}`;
      }
    }
    if (config.scope) {
      url += `&scope=${config.scope.join(' ')}`;
    }
    if (config.prompt) {
      url += `&prompt=${config.prompt}`;
    }
    if (config.metadata) {
      url += `&metadata=${config.metadata}`;
    }
    if (config.state) {
      url += `&state=${config.state}`;
    }

    // Add code challenge to URL generation
    url += `&code_challenge_method=s256`
    const secret = uuid()
    const secretHash = this.hashPKCESecret(secret)
    url += `&code_challenge=${secret}`
    // Return the url with secret & hashed secret
    return {secret, secretHash, url};
  }

  private hashPKCESecret(secret: string): string{
    return Buffer.from(sha256(secret)).toString('base64');
  }

  /**
   * Build the URL for admin consent authentication for Microsoft
   * @param AuthConfig Configuration for the authentication process
   * @return The URL for hosted authentication
   */
  public urlForAdminConsent(config: AdminConsentAuth): string {
    this.checkAuthCredentials();

    let url = `${this.apiClient.serverUrl}v3/connect/auth?client_id=${
      this.apiClient.clientId
    }&redirect_uri=${config.redirectUri}&access_type=${
      config.accessType ? config.accessType : 'offline'
    }&response_type=adminconsent&provider=microsoft`;
    if (config.loginHint) {
      url += `&login_hint=${config.loginHint}`;
      if (config.includeGrantScopes) {
        url += `&include_grant_scopes=${config.includeGrantScopes}`;
      }
    }
    if (config.scope) {
      url += `&scope=${config.scope.join(' ')}`;
    }
    if (config.prompt) {
      url += `&prompt=${config.prompt}`;
    }
    if (config.metadata) {
      url += `&metadata=${config.metadata}`;
    }
    if (config.state) {
      url += `&state=${config.state}`;
    }
    return url;
  }

  private checkAuthCredentials(): void {
    if (!this.apiClient.clientId || !this.apiClient.clientSecret) {
      throw new Error('ClientID & ClientSecret are required for using auth');
    }
  }

  /**
   * Revoke a single access token
   * @param accessToken The access token to revoke
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
