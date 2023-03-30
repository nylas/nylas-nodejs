type AccessType = 'online' | 'offline';
type Provider = 'google' | 'microsoft';

export type AdminConsentAuth = SharedAuthParams & {
  credentialId: string;
};

type SharedAuthParams = {
  accessType?: AccessType;
  prompt?: string;
  redirectUri: string;
  scope?: Array<string>;
  includeGrantScopes: boolean;
  metadata?: string;
  state?: string;
  loginHint?: string;
};

export type AuthConfig = SharedAuthParams & {
  provider: Provider;
};

export interface CodeExchangeRequest {
  redirectUri: string;
  code: string;
}

export interface TokenExchangeRequest {
  redirectUri: string;
  refreshToken: string;
}
