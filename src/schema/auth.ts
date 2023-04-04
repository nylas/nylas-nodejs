import { z } from 'zod';
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

export type OpenID = z.infer<typeof OpenIDSchema>;
export const OpenIDResponseSchema = ItemResponseSchema.extend({
  data: OpenIDSchema,
});