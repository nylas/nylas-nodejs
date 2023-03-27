import { z } from 'zod';

export const ErrorResponseSchema = z.object({
  requestId: z.string(),
  error: z.object({
    type: z.string(),
    message: z.string(),
    providerError: z.any(),
  }),
});

export type NylasErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const ItemResponseSchema = z.object({
  requestId: z.string(),
  error: ErrorResponseSchema.optional(),
});

export const ListResponseSchema = z.object({
  requestId: z.string(),
  nextCursor: z.string().optional(),
  error: ErrorResponseSchema.optional(),
});

export interface ItemResponse<T> {
  requestId: string;
  data: T;
  error?: NylasErrorResponse;
}

export interface ListResponse<T> {
  requestId: string;
  data: T[];
  nextCursor?: string;
  error?: NylasErrorResponse;
}

export type ListResponseInnerType<T> = T extends ListResponse<infer R>
  ? R
  : never;
