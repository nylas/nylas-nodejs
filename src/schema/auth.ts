import { GoogleScopes, MicrosoftScopes, Scope, YahooScopes } from './scopes';

type AccessType = 'online' | 'offline';
type Provider = 'google' | 'microsoft';

export type AdminConsentAuth = SharedAuthParams & {
  credentialId: string;
};

type SharedAuthParams = {
  accessType?: AccessType;
  prompt?: string;
  redirectUri: string;
  scope?: Scope[];
  includeGrantScopes: boolean;
  metadata?: string;
  state?: string;
  loginHint?: string;
};

export type AuthConfig =
  | (SharedAuthParams & {
      scope: GoogleScopes[];
      provider: 'google';
    })
  | (SharedAuthParams & {
      scope: YahooScopes[];
      provider: 'yahoo';
    })
  | (SharedAuthParams & {
      scope: MicrosoftScopes[];
      provider: 'microsoft';
    });

export interface CodeExchangeRequest {
  redirectUri: string;
  code: string;
}

export interface TokenExchangeRequest {
  redirectUri: string;
  refreshToken: string;
}
