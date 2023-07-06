export interface ItemResponse<T> {
  requestId: string;
  data: T;
}

export interface ListResponse<T> {
  requestId: string;
  data: T[];
  nextCursor?: string;
}

export interface NylasApiErrorResponse {
  requestId: string;
  error: NylasApiError;
}

export interface NylasApiError {
  type: string;
  message: string;
  providerError?: Record<string, unknown>;
}

export interface DeleteResponse {
  requestId: string;
}

export interface AuthErrorResponse {
  requestId: string;
  error: string;
  errorCode: number;
  errorDescription: string;
  errorUri: string;
}

export interface TokenValidationErrorResponse {
  success: boolean;
  error: {
    httpCode: number;
    eventCode: number;
    type: string;
    message: string;
    requestId: string;
  };
}

export interface ExchangeResponse {
  accessToken: string;
  grantId: string;
  expiresIn: number;
  refreshToken?: string;
  idToken?: string;
  tokenType?: string;
  scope: string;
}

export type ListResponseInnerType<T> = T extends ListResponse<infer R>
  ? R
  : never;
