import { z } from 'zod';

export const ErrorResponseSchema = z.object({
  requestId: z.string(),
  error: z.object({
    type: z.string(),
    message: z.string(),
    providerError: z.any(),
  }),
});
export const AuthErrorResponseSchema = z.object({
  request_id: z.string(),
  error: z.string(),
  error_code: z.number(),
  error_description: z.string(),
  error_uri: z.string(),
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

export const ExchangeResponseSchema = z.object({
  accessToken: z.string(),
  grantId: z.string(),
  expiresIn: z.number(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
  tokenType: z.string().optional(),
  scope: z.string()
});
export const EmptyResponseSchema = z.object({
});

export interface ListResponse<T> {
  requestId: string;
  data: T[];
  nextCursor?: string;
  error?: APIErrorResponse;
}

export type AllowedResponse<T> = Response<T> | ListResponse<T>| ExchangeResponse | EmptyResponse | null;
export type AllowedResponseInnerType<T> = T extends AllowedResponse<infer R>
  ? R
  : never;

export type APIResponse = z.infer<typeof ResponseSchema>;
export type APIListResponse = z.infer<typeof ListResponseSchema>;
export type APIErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type AuthErrorResponse = z.infer<typeof AuthErrorResponseSchema>;
export type ExchangeResponse = z.infer<typeof ExchangeResponseSchema>;
export type EmptyResponse = z.infer<typeof EmptyResponseSchema>;
