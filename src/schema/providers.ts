import { z } from 'zod';
import { ItemResponseSchema, ListResponseSchema } from './response';

export interface ProviderDetectParams {
  email: string;
  allProviderTypes?: boolean;
}

export const ProviderDetectSchema = z.object({
  emailAddress: z.string(),
  provider: z.string().optional(),
  type: z.string().optional(),
  detected: z.boolean(),
});

export const ProviderSchema = z
  .object({
    name: z.string(),
    provider: z.string(),
    type: z.string(),
    settings: z
      .object({
        name: z.string().optional(),
        imapHost: z.string().optional(),
        imapPort: z.number().optional(),
        smtpHost: z.string().optional(),
        smtpPort: z.number().optional(),
        passwordLink: z.string().optional(),
        primary: z.boolean().optional(),
      })
      .nullish(),
  })
  .optional();

export const ProviderDetectResponseSchema = ItemResponseSchema.extend({
  data: ProviderDetectSchema,
});
export const ProviderListResponseSchema = ListResponseSchema.extend({
  data: z.array(ProviderSchema),
});
export type Provider = z.infer<typeof ProviderSchema>;
export type ProviderDetect = z.infer<typeof ProviderDetectSchema>;
