export interface ItemResponse<T> {
  request_id: string;
  data: T;
}

export interface ListResponse<T> {
  request_id: string;
  data: T[];
  next_cursor?: string;
}

export interface NylasApiErrorResponse {
  request_id: string;
  error: NylasApiError;
}

export interface NylasApiError {
  type: string;
  message: string;
  provider_error?: Record<string, unknown>;
}

export interface DeleteResponse {
  request_id: string;
}

export interface AuthErrorResponse {
  request_id: string;
  error: string;
  error_code: number;
  error_description: string;
  error_uri: string;
}

export interface TokenValidationErrorResponse {
  success: boolean;
  error: {
    http_code: number;
    event_code: number;
    type: string;
    message: string;
    request_id: string;
  };
}

export interface ExchangeResponse {
  access_token: string;
  grant_id: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  token_type?: string;
  scope: string;
}

export type ListResponseInnerType<T> = T extends ListResponse<infer R>
  ? R
  : never;
