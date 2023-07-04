import {
  NylasApiErrorResponse,
  AuthErrorResponse,
  TokenValidationErrorResponse,
} from './response';

/**
 * Extended Error class for errors returned from the Nylas API
 *
 * Properties:
 */
export class NylasApiError extends Error {
  type: string;
  request_id: string;
  provider_error: any;

  constructor(apiError: NylasApiErrorResponse) {
    super(apiError.error.message);
    this.type = apiError.error.type;
    this.request_id = apiError.request_id;
    this.provider_error = apiError.error.provider_error;
  }
}

export class NylasAuthError extends Error {
  type: string;
  request_id: string;
  provider_error: any;

  constructor(apiError: AuthErrorResponse) {
    super(apiError.error_description);
    this.type = apiError.error;
    this.request_id = apiError.request_id;
    this.provider_error = apiError.error_description;
  }
}
export class NylasTokenValidationError extends Error {
  type: string;
  request_id: string;
  provider_error: any;

  constructor(apiError: TokenValidationErrorResponse) {
    super(apiError.error.message);
    this.type = apiError.error.type;
    this.request_id = apiError.error.request_id;
    this.provider_error = apiError.error.message;
  }
}

// TODO: sdk error schema?
