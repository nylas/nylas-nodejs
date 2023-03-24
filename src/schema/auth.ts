import { z } from 'zod';

const Providers = z
  .union([
    z.literal('google'),
    z.literal('microsoft'),
    z.literal('google,microsoft'),
    z.literal('microsoft,google'),
  ])
  .optional();
const AccessType = z.union([z.literal('online'), z.literal('offline')]);
const ResponseType = z.union([z.literal('code'), z.literal('adminconsent')]);
const Prompt = z
  .union([
    z.literal('select_provider'),
    z.literal('detect'),
    z.literal('select_provider,detect'),
    z.literal('detect,select_provider'),
  ])
  .optional();

export const AuthConfigSchema = z.object({
  redirectUri: z.string().url(),
  provider: Providers,
  scope: z
    .string()
    .array()
    .optional(),
  responseType: ResponseType.default('code'),
  accessType: AccessType.default('offline'),
  loginHint: z.string().optional(),
  includeGrantScopes: z.boolean().optional(),
  prompt: Prompt,
  metadata: z.string().optional(),
  state: z.string().optional(),
  credentialId: z.string().optional(),
});
export const CodeExchangeRequestSchema = z.object({
  redirectUri: z.string().url(),
  code: z.string(),
});
export const TokenExchangeRequestSchema = z.object({
  redirectUri: z.string().url(),
  refreshToken: z.string(),
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;
export type CodeExchangeRequest = z.infer<typeof CodeExchangeRequestSchema>;
export type TokenExchangeRequest = z.infer<typeof TokenExchangeRequestSchema>;
