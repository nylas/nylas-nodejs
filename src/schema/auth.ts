type AccessType = 'online' | 'offline';
type Provider = 'google' | 'imap' | 'microsoft' | 'yahoo';

export type AuthConfig = {
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

export type AdminConsentAuth = AuthConfig & {
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

export type HostedAuthRequest = {
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

export interface HostedAuth {
  url: string;
  id: string;
  expiresAt: number;
  request: HostedAuthRequest;
}

export interface PKCEAuthURL {
  url: string;
  secret: string;
  secretHash: string;
}
