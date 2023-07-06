export interface NylasResponse<T> {
  requestId: string;
  data: T;
}

export interface NylasListResponse<T> {
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

export interface NylasDeleteResponse {
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

export type ListResponseInnerType<T> = T extends NylasListResponse<infer R>
  ? R
  : never;
