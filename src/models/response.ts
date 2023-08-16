/**
 * Interface representation of a Nylas response object
 */
export interface NylasResponse<T> {
  /**
   * The requested data object
   */
  data: T;
  /**
   * The request ID
   */
  requestId: string;
}

/**
 * Interface representation of a Nylas response object that contains a list of objects.
 */
export interface NylasListResponse<T> {
  /**
   * The list of requested data objects.
   */
  data: T[];
  /**
   * The request ID.
   */
  requestId: string;
  /**
   * The cursor to use to get the next page of data.
   */
  nextCursor?: string;
}

export interface NylasApiErrorResponse {
  requestId: string;
  error: NylasApiError;
}

/**
 * Interface representation of a general Nylas API error.
 */
export interface NylasApiError {
  type: string;
  message: string;
  providerError?: Record<string, unknown>;
}

/**
 * Interface representing a response to a delete request.
 */
export interface NylasDeleteResponse {
  requestId: string;
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

/**
 * Helper type for pagination
 */
export type ListResponseInnerType<T> = T extends NylasListResponse<infer R>
  ? R
  : never;
