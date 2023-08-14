type AccessType = 'online' | 'offline';
type Provider = 'google' | 'imap' | 'microsoft' | 'yahoo';

export type URLForAuthenticationConfig = {
  clientId: string;
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

export interface CodeExchangeRequest {
  redirectUri: string;
  code: string;
  codeVerifier?: string; // Only For PKCE auth requests
}

export interface TokenExchangeRequest {
  redirectUri: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
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
