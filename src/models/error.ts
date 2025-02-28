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
  /**
   * The flow ID
   * Provide this to Nylas support to help trace requests and responses
   */
  flowId?: string | null;
  /**
   * The response headers
   */
  headers?: Record<string, string>;
}

/**
 * Base class for all Nylas SDK errors.
 */
export abstract class AbstractNylasSdkError extends Error {}

/**
 * Class representation of a general Nylas API error.
 */
export class NylasApiError extends AbstractNylasApiError
  implements NylasApiErrorResponseData {
  /**
   * Error type.
   */
  type: string;
  /**
   * Provider Error.
   */
  providerError: any;

  constructor(
    apiError: NylasApiErrorResponse,
    statusCode?: number,
    requestId?: string,
    flowId?: string,
    headers?: Record<string, string>
  ) {
    super(apiError.error.message);
    this.type = apiError.error.type;
    this.requestId = requestId;
    this.flowId = flowId;
    this.headers = headers;
    this.providerError = apiError.error.providerError;
    this.statusCode = statusCode;
  }
}

/**
 * Class representing an OAuth error returned by the Nylas API.
 */
export class NylasOAuthError extends AbstractNylasApiError
  implements NylasOAuthErrorResponse {
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

  constructor(
    apiError: NylasOAuthErrorResponse,
    statusCode?: number,
    requestId?: string,
    flowId?: string,
    headers?: Record<string, string>
  ) {
    super(apiError.errorDescription);
    this.error = apiError.error;
    this.errorCode = apiError.errorCode;
    this.errorDescription = apiError.errorDescription;
    this.errorUri = apiError.errorUri;
    this.statusCode = statusCode;
    this.requestId = requestId;
    this.flowId = flowId;
    this.headers = headers;
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
  /**
   * The request ID
   */
  requestId?: string;
  /**
   * The flow ID
   * Provide this to Nylas support to help trace requests and responses
   */
  flowId?: string;
  /**
   * The response headers
   */
  headers?: Record<string, string>;

  constructor(
    url: string,
    timeout: number,
    requestId?: string,
    flowId?: string,
    headers?: Record<string, string>
  ) {
    super('Nylas SDK timed out before receiving a response from the server.');
    this.url = url;
    this.timeout = timeout;
    this.requestId = requestId;
    this.flowId = flowId;
    this.headers = headers;
  }
}

/**
 * Interface representing the error response from the Nylas API.
 */

export interface NylasApiErrorResponse {
  requestId: string;
  error: NylasApiErrorResponseData;
  flowId?: string;
  headers?: Record<string, string>;
}

/**
 * Interface representing the error data within the response object.
 */
export interface NylasApiErrorResponseData {
  type: string;
  message: string;
  providerError?: any;
}

/**
 * Interface representing an OAuth error returned by the Nylas API.
 */
export interface NylasOAuthErrorResponse {
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
}
