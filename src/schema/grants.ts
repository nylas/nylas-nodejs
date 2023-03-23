import { z } from 'zod';

export const GrantSchema = z.object({
  id: z.string(),
  provider: z.string(),
  scope: z.array(z.string()),
  createdAt: z.number(),
  grantStatus: z.string().optional(),
  email: z.string().optional(),
  userAgent: z.string().optional(),
  ip: z.string().optional(),
  state: z.string().optional(),
  updatedAt: z.number().optional(),
  providerUserId: z.string().optional(),
});

export type Grant = z.infer<typeof GrantSchema>;
