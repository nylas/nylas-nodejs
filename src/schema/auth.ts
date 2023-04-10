import {z} from 'zod'
import { ItemResponseSchema } from './response';

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

export type HostedAuthRequest = {
  provider: Provider;
  redirectUri: string;
  scope?: Array<string>;
  state?: string;
  loginHint?: string;
  cookieNonce?: string;
};

const HostedAuthSchema = z.object({
  url: z.string(),
  id: z.string(),
  expiresIn: z.number(),
  request: z.object({
    redirectUri: z.string(),
    provider: z.string(),
    scope: z.array(z.string()).nullable(),
    state: z.string().nullable(),
    loginHint: z.string().nullable(),
  })
});

export type HostedAuth = z.infer<typeof HostedAuthSchema>;
export const HostedAuthResponseSchema = ItemResponseSchema.extend({
  data: HostedAuthSchema,
});

