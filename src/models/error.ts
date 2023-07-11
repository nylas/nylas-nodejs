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
  requestId: string;
  providerError: any;

  constructor(apiError: NylasApiErrorResponse) {
    super(apiError.error.message);
    this.type = apiError.error.type;
    this.requestId = apiError.requestId;
    this.providerError = apiError.error.providerError;
  }
}

export class NylasAuthError extends Error {
  type: string;
  requestId: string;
  providerError: any;

  constructor(apiError: AuthErrorResponse) {
    super(apiError.errorDescription);
    this.type = apiError.error;
    this.requestId = apiError.requestId;
    this.providerError = apiError.errorDescription;
  }
}
export class NylasTokenValidationError extends Error {
  type: string;
  requestId: string;
  providerError: any;

  constructor(apiError: TokenValidationErrorResponse) {
    super(apiError.error.message);
    this.type = apiError.error.type;
    this.requestId = apiError.error.requestId;
    this.providerError = apiError.error.message;
  }
}

// TODO: sdk error models?
