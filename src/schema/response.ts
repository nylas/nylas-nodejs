import { z } from 'zod';

export const ErrorResponseSchema = z.object({
  requestId: z.string(),
  error: z.object({
    type: z.string(),
    message: z.string(),
    providerError: z.any(),
  }),
});

export const ResponseSchema = z.object({
  requestId: z.string(),
  data: z.record(z.string(), z.any()),
  error: ErrorResponseSchema.optional(),
});

export const ListResponseSchema = z.object({
  requestId: z.string(),
  data: z.array(z.record(z.string(), z.any())),
  nextCursor: z.string().optional(),
  error: ErrorResponseSchema.optional(),
});

export interface Response<T> {
  requestId: string;
  data: T;
  error?: APIErrorResponse;
}

export interface ListResponse<T> {
  requestId: string;
  data: T[];
  nextCursor?: string;
  error?: APIErrorResponse;
}

export interface ListQueryParams {
  limit?: number;
  pageToken?: string;
}

export interface List<T> extends ListResponse<T> {
  next?: () => Promise<List<T>>;
}

export type AllowedResponse<T> = Response<T> | ListResponse<T> | null;
export type AllowedResponseInnerType<T> = T extends AllowedResponse<infer R>
  ? R
  : never;

export type APIResponse = z.infer<typeof ResponseSchema>;
export type APIListResponse = z.infer<typeof ListResponseSchema>;
export type APIErrorResponse = z.infer<typeof ErrorResponseSchema>;
