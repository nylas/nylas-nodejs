import { z } from 'zod';

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

export const CodeExchangeRequestSchema = z.object({
  redirectUri: z.string().url(),
  code: z.string(),
});
export const TokenExchangeRequestSchema = z.object({
  redirectUri: z.string().url(),
  refreshToken: z.string(),
});

export type CodeExchangeRequest = z.infer<typeof CodeExchangeRequestSchema>;
export type TokenExchangeRequest = z.infer<typeof TokenExchangeRequestSchema>;
