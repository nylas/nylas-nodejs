import APIClient from '../apiClient';
import { BaseResource } from './baseResource';
import { Grants } from './grants';
import {
  AuthConfig,
  AuthConfigSchema,
  CodeExchangeRequest,
  CodeExchangeRequestSchema,
  TokenExchangeRequest,
  TokenExchangeRequestSchema,
} from '../schema/auth';
import {
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

    CodeExchangeRequestSchema.parse(payload);
    const res = await this.apiClient.request<ExchangeResponse>(
      {
        method: 'POST',
        path: `/v3/connect/token`,
        body: {
          code: payload.code,
          redirect_uri: payload.redirectUri,
          client_id: this.apiClient.clientId,
          client_secret: this.apiClient.clientSecret,
          grant_type: 'authorization_code',
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
  public async exchangeToken(
    payload: TokenExchangeRequest
  ): Promise<ExchangeResponse> {
    this.checkAuthCredentials();

    TokenExchangeRequestSchema.parse(payload);
    const res = await this.apiClient.request<ExchangeResponse>(
      {
        method: 'POST',
        path: `/v3/connect/token`,
        body: {
          refresh_token: payload.refreshToken,
          redirect_uri: payload.redirectUri,
          client_id: this.apiClient.clientId,
          client_secret: this.apiClient.clientSecret,
          grant_type: 'refresh_token',
        },
      },
      {
        responseSchema: ExchangeResponseSchema,
      }
    );

    return res;
  }

  /**
   * Build the URL for authenticating users to your application via Hosted Authentication
   * @param AuthConfig Configuration for the authentication process
   * @return The URL for hosted authentication
   */
  public urlForAuthentication(config: AuthConfig): string {
    this.checkAuthCredentials();
    config = AuthConfigSchema.parse(config);

    let url = `${this.apiClient.serverUrl}v3/connect/auth?client_id=${this.apiClient.clientId}&redirect_uri=${config.redirectUri}&access_type=${config.accessType}&response_type=${config.responseType}`;
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

    if (config.responseType == `adminconsent` && config.credentialId) {
      url += `&credential_id=${config.credentialId}`;
    }
    if (
      config.responseType == `adminconsent` &&
      (config.provider != `microsoft` || !config.credentialId)
    ) {
      throw new Error(
        `Response type "adminconsent" used only for Microsoft admin consent service account flow with "credential_id".`
      );
    }
    return url;
  }
  /**
   * Build the URL for authenticating users to your application via Hosted Authentication
   * @param AuthConfig Configuration for the authentication process
   * @return The URL for hosted authentication
   */
  public urlForAdminConsent(config: AuthConfig): string {
    this.checkAuthCredentials();
    config = AuthConfigSchema.parse(config);

    let url = `${this.apiClient.serverUrl}v3/connect/auth?client_id=${this.apiClient.clientId}&redirect_uri=${config.redirectUri}&access_type=${config.accessType}&response_type=adminconsent&provider=microsoft`;
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

    if (config.responseType == `adminconsent` && config.credentialId) {
      url += `&credential_id=${config.credentialId}`;
    }
    if (
      config.responseType == `adminconsent` &&
      (config.provider != `microsoft` || !config.credentialId)
    ) {
      throw new Error(
        `Response type "adminconsent" used only for Microsoft admin consent service account flow with "credential_id".`
      );
    }
    return url;
  }

  private checkAuthCredentials() {
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
