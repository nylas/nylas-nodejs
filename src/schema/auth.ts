import { z } from 'zod';
import { ItemResponseSchema } from './response';

type AccessType = 'online' | 'offline';
type Provider = "google" | "imap" | "microsoft" | "yahoo"

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

export const OpenIDSchema = z.object({
  iss: z.string(), // Issuer
  aud: z.string(), // Application Slug
  sub: z.string().optional(), // ID
  email: z.string().optional(),
  emailVerified: z.boolean().optional(),
  atHash: z.string().optional(),
  iat: z.number(), // Issued At
  exp: z.number(), // Expites At
  // Profile
  name: z.string().optional(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  nickName: z.string().optional(),
  pictureURL: z.string().optional(),
  gender: z.string().optional(),
  locale: z.string().optional(),
});

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
  state?: string;
  loginHint?: string;
  cookieNonce?: string;
  scope?: string[];
  provider?: Provider;
};

export const HostedAuthSchema = z.object({
  url: z.string(),
  id: z.string(),
  expiresAt: z.number(),
  request: z.object({
    redirectUri: z.string(),
    provider: z.string(),
    scope: z.array(z.string()).optional(),
    state: z.string().optional(),
    loginHint: z.string().optional(),
    prompt: z.string().optional(),
    includeGrantedScopes: z.boolean().optional(),
  }),
});

export type HostedAuth = z.infer<typeof HostedAuthSchema>;
export const HostedAuthResponseSchema = ItemResponseSchema.extend({
  data: HostedAuthSchema,
});
export interface PKCEAuthURL {
  url: string;
  secret: string;
  secretHash: string;
}
export type OpenID = z.infer<typeof OpenIDSchema>;
