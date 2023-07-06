type AccessType = 'online' | 'offline';
type Provider = 'google' | 'imap' | 'microsoft' | 'yahoo';

export type AuthConfig = {
  redirect_uri: string;
  provider?: Provider;
  access_type?: AccessType;
  prompt?: string;
  scope?: string[];
  include_grant_scopes?: boolean;
  metadata?: string;
  state?: string;
  login_hint?: string;
};

export type AdminConsentAuth = AuthConfig & {
  credentialId: string;
};

export interface OpenID {
  iss: string; // Issuer
  aud: string; // Application Slug
  sub?: string; // ID
  email?: string;
  email_verified?: boolean;
  at_hash?: string;
  iat: number; // Issued At
  exp: number; // Expites At
  // Profile
  name?: string;
  given_name?: string;
  family_name?: string;
  nick_name?: string;
  picture_url?: string;
  gender?: string;
  locale?: string;
}

export interface CodeExchangeRequest {
  redirect_uri: string;
  code: string;
  code_verifier?: string; // Only For PKCE auth requests
}

export interface TokenExchangeRequest {
  redirect_uri: string;
  refresh_token: string;
}

export type HostedAuthRequest = {
  redirect_uri: string;
  provider?: Provider;
  state?: string;
  login_hint?: string;
  cookie_nonce?: string;
  grant_id?: string;
  scope?: string[];
  expires_in?: number;
  settings?: Record<string, unknown>;
};

export interface HostedAuth {
  url: string;
  id: string;
  expires_at: number;
  request: HostedAuthRequest;
}

export interface PKCEAuthURL {
  url: string;
  secret: string;
  secret_hash: string;
}
