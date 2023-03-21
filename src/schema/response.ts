import { z } from 'zod';

export const ResponseSchema = z.object({
  requestId: z.string(),
  data: z.record(z.string(), z.any()),
});

export const ListResponseSchema = z.object({
  requestId: z.string(),
  data: z.array(z.record(z.string(), z.any())),
  nextCursor: z.string(),
});

export interface Response<T> {
  requestId: string;
  data: T;
}

export interface ListResponse<T> {
  requestId: string;
  data: T[];
  nextCursor?: string;
}

export type APIResponse = z.infer<typeof ResponseSchema>;
export type APIListResponse = z.infer<typeof ListResponseSchema>;
