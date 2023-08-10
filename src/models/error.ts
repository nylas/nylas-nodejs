import { NylasApiErrorResponse, AuthErrorResponse } from './response';

/**
 * Base class for all Nylas API errors.
 */
export abstract class AbstractNylasApiError extends Error {
  /**
   * The unique identifier of the request.
   */
  requestId?: string;
  /**
   * The HTTP status code of the error response.
   */
  statusCode?: number;
}

/**
 * Base class for all Nylas SDK errors.
 */
export abstract class AbstractNylasSdkError extends Error {}

/**
 * Class representation of a general Nylas API error.
 */
export class NylasApiError extends AbstractNylasApiError {
  /**
   * Error type.
   */
  type: string;
  /**
   * Provider Error.
   */
  providerError: any;

  constructor(apiError: NylasApiErrorResponse, statusCode?: number) {
    super(apiError.error.message);
    this.type = apiError.error.type;
    this.requestId = apiError.requestId;
    this.providerError = apiError.error.providerError;
    this.statusCode = statusCode;
  }
}

/**
 * Class representing an OAuth error returned by the Nylas API.
 */
export class NylasOAuthError extends AbstractNylasApiError {
  /**
   * Error type.
   */
  error: string;
  /**
   * Error code used for referencing the docs, logs, and data stream.
   */
  errorCode: number;
  /**
   * Human readable error description.
   */
  errorDescription: string;
  /**
   * URL to the related documentation and troubleshooting regarding this error.
   */
  errorUri: string;

  constructor(apiError: AuthErrorResponse, statusCode?: number) {
    super(apiError.errorDescription);
    this.error = apiError.error;
    this.errorCode = apiError.errorCode;
    this.errorDescription = apiError.errorDescription;
    this.errorUri = apiError.errorUri;
    this.statusCode = statusCode;
  }
}

/**
 * Error thrown when the Nylas SDK times out before receiving a response from the server
 */
export class NylasSdkTimeoutError extends AbstractNylasSdkError {
  /**
   * The URL that timed out
   */
  url: string;
  /**
   * The timeout value set in the Nylas SDK, in seconds
   */
  timeout: number;

  constructor(url: string, timeout: number) {
    super('Nylas SDK timed out before receiving a response from the server.');
    this.url = url;
    this.timeout = timeout;
  }
}
