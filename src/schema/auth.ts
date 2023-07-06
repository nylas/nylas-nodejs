type AccessType = 'online' | 'offline';
type Provider = 'google' | 'imap' | 'microsoft' | 'yahoo';

export type URLForAuthenticationConfig = {
  redirectUri: string;
  provider?: Provider;
  accessType?: AccessType;
  prompt?: string;
  scope?: string[];
  includeGrantScopes?: boolean;
  metadata?: string;
  state?: string;
  loginHint?: string;
};

export type URLForAdminConsentConfig = URLForAuthenticationConfig & {
  credentialId: string;
};

export interface OpenID {
  iss: string; // Issuer
  aud: string; // Application Slug
  sub?: string; // ID
  email?: string;
  emailVerified?: boolean;
  atHash?: string;
  iat: number; // Issued At
  exp: number; // Expites At
  // Profile
  name?: string;
  givenName?: string;
  familyName?: string;
  nickName?: string;
  pictureUrl?: string;
  gender?: string;
  locale?: string;
}

export interface CodeExchangeRequest {
  redirectUri: string;
  code: string;
  codeVerifier?: string; // Only For PKCE auth requests
}

export interface TokenExchangeRequest {
  redirectUri: string;
  refreshToken: string;
}

export type ServerSideHostedAuthRequest = {
  redirectUri: string;
  provider?: Provider;
  state?: string;
  loginHint?: string;
  cookieNonce?: string;
  grantId?: string;
  scope?: string[];
  expiresIn?: number;
  settings?: Record<string, unknown>;
};

export interface ServerSideHostedAuthResponse {
  url: string;
  id: string;
  expiresAt: number;
  request: ServerSideHostedAuthRequest;
}

export interface PKCEAuthURL {
  url: string;
  secret: string;
  secretHash: string;
}

export interface CodeExchangeResponse {
  accessToken: string;
  grantId: string;
  expiresIn: number;
  refreshToken?: string;
  idToken?: string;
  tokenType?: string;
  scope: string;
}
