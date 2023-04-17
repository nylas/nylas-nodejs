import { z } from 'zod';
import { ItemResponseSchema } from './response';
import { GoogleScopes, MicrosoftScopes, Scope, YahooScopes } from './scopes';

type AccessType = 'online' | 'offline';

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
})

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

export const HostedAuthSchema = z.object({
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

export type OpenID = z.infer<typeof OpenIDSchema>;
export const OpenIDResponseSchema = ItemResponseSchema.extend({
  data: OpenIDSchema,
});
