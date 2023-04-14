import { z } from 'zod';

const ErrorObjectSchema = z.object({
  type: z.string(),
  message: z.string(),
  providerError: z.any(),
});
export type NylasErrorObject = z.infer<typeof ErrorObjectSchema>;

export const ErrorResponseSchema = z.object({
  requestId: z.string(),
  error: ErrorObjectSchema,
});

export const AuthErrorResponseSchema = z.object({
  requestId: z.string(),
  error: z.string(),
  errorCode: z.number(),
  errorDescription: z.string(),
  errorUri: z.string(),
});

export type NylasErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const ItemResponseSchema = z.object({
  requestId: z.string(),
  error: ErrorObjectSchema.optional(),
});

export const ListResponseSchema = z.object({
  requestId: z.string(),
  nextCursor: z.string().optional(),
  error: ErrorObjectSchema.optional(),
});

export interface ItemResponse<T> {
  requestId: string;
  data: T;
  error?: NylasErrorObject;
}

export const ExchangeResponseSchema = z.object({
  accessToken: z.string(),
  grantId: z.string(),
  expiresIn: z.number(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
  tokenType: z.string().optional(),
  scope: z.string(),
});
export const EmptyResponseSchema = z.object({});

export interface ListResponse<T> {
  requestId: string;
  data: T[];
  nextCursor?: string;
  error?: NylasErrorObject;
}

export const DeleteResponseSchema = z.object({
  requestId: z.string(),
});

export type ExchangeResponse = z.infer<typeof ExchangeResponseSchema>;
export type EmptyResponse = z.infer<typeof EmptyResponseSchema>;
export type AuthErrorResponse = z.infer<typeof AuthErrorResponseSchema>;
export type DeleteResponse = z.infer<typeof DeleteResponseSchema>;

export type ListResponseInnerType<T> = T extends ListResponse<infer R>
  ? R
  : never;
