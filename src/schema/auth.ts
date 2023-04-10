import {z} from 'zod'
import { ItemResponseSchema } from './response';
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

type SharedHostedAuthRequest = {
  provider: Provider;
  redirectUri: string;
  state?: string;
  loginHint?: string;
  cookieNonce?: string;
};

export type HostedAuthRequest =
  | (SharedHostedAuthRequest & {
      scope?: GoogleScopes[];
      provider: 'google';
    })
  | (SharedHostedAuthRequest & {
      scope?: YahooScopes[];
      provider: 'yahoo';
    })
  | (SharedHostedAuthRequest & {
      scope?: MicrosoftScopes[];
      provider: 'microsoft';
    });

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

