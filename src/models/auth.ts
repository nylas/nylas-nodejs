/**
 * Type for the access type of the authentication URL.
 */
type AccessType = 'online' | 'offline';

/**
 * Type for the different OAuth providers Nylas supports.
 */
export type Provider = 'google' | 'imap' | 'microsoft';

/**
 * Configuration for generating a URL for OAuth 2.0 authentication.
 */
export interface URLForAuthenticationConfig {
  /**
   * The client ID of your application.
   */
  clientId: string;
  /**
   * Redirect URI of the integration.
   */
  redirectUri: string;
  /**
   * The integration provider type that you already had set up with Nylas for this application.
   * If not set, the user is directed to the Hosted Login screen and prompted to select a provider.
   */
  provider?: Provider;
  /**
   * If the exchange token should return a refresh token too. Not suitable for client side or JavaScript apps.
   */
  accessType?: AccessType;
  /**
   * The prompt parameter is used to force the consent screen to be displayed even if the user has already given consent to your application.
   */
  prompt?: string;
  /**
   * A space-delimited list of scopes that identify the resources that your application could access on the user's behalf.
   * If no scope is given, all of the default integration's scopes are used.
   */
  scope?: string[];
  /**
   * If set to true, the scopes granted to the application will be included in the response.
   */
  includeGrantScopes?: boolean;
  /**
   * Optional state to be returned after authentication
   */
  state?: string;
  /**
   * Prefill the login name (usually email) during authorization flow.
   * If a Grant for the provided email already exists, a Grant's re-auth will automatically be initiated.
   */
  loginHint?: string;
}

/**
 * Configuration for generating a URL for admin consent authentication for Microsoft.
 */
export interface URLForAdminConsentConfig extends URLForAuthenticationConfig {
  /**
   * The credential ID for the Microsoft account
   */
  credentialId: string;
}

/**
 * Interface of a Nylas code exchange request
 */
export interface CodeExchangeRequest {
  /**
   * Should match the same redirect URI that was used for getting the code during the initial authorization request.
   */
  redirectUri: string;
  /**
   * OAuth 2.0 code fetched from the previous step.
   */
  code: string;
  /**
   * Client ID of the application.
   */
  clientId: string;
  /**
   * Client secret of the application.
   */
  clientSecret: string;
  /**
   * The original plain text code verifier (code_challenge) used in the initial authorization request (PKCE).
   */
  codeVerifier?: string;
}

/**
 * Interface of a Nylas token exchange request
 */
export interface TokenExchangeRequest {
  /**
   * Should match the same redirect URI that was used for getting the code during the initial authorization request.
   */
  redirectUri: string;
  /**
   * Token to refresh/request your short-lived access token
   */
  refreshToken: string;
  /**
   * Client ID of the application.
   */
  clientId: string;
  /**
   * Client secret of the application.
   */
  clientSecret: string;
}

/**
 * Interface of the object containing the OAuth 2.0 URL as well as the hashed secret.
 */
export interface PKCEAuthURL {
  /**
   * The URL for hosted authentication
   */
  url: string;
  /**
   * Server-side challenge used in the OAuth 2.0 flow
   */
  secret: string;
  /**
   * SHA-256 hash of the secret
   */
  secretHash: string;
}

/**
 * Interface of a Nylas code exchange response
 */
export interface CodeExchangeResponse {
  /**
   * Supports exchanging the code for tokens, or refreshing an access token using [Auth.refreshAccessToken][com.nylas.resources.Auth.refreshAccessToken].
   */
  accessToken: string;
  /**
   * Nylas grant ID that is now successfully created.
   */
  grantId: string;
  /**
   * The remaining lifetime of the access token in seconds.
   */
  expiresIn: number;
  /**
   * List of scopes associated with this token.
   */
  scope: string;
  /**
   * Only returned if the code was requested using [AccessType.OFFLINE][com.nylas.models.AccessType.OFFLINE].
   */
  refreshToken?: string;
  /**
   * A JWT that contains identity information about the user that is digitally signed by Nylas.
   */
  idToken?: string;
  /**
   * Currently always Bearer.
   */
  tokenType?: string;
}
