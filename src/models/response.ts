/**
 * Interface representing a base response to a request.
 */
export interface NylasBaseResponse {
  requestId: string;
  /**
   * The flow ID
   * Provide this to Nylas support to help trace requests and responses
   */
  flowId?: string;
  /**
   * The response headers with camelCased keys (backwards compatible)
   */
  headers?: Record<string, string>;
  /**
   * The raw response headers with original dashed lowercase keys
   */
  rawHeaders?: Record<string, string>;
}

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
  /**
   * The flow ID
   * Provide this t
   */
  flowId?: string;
  /**
   * The response headers
   */
  headers?: Record<string, string>;
  /**
   * The raw response headers with original dashed lowercase keys
   */
  rawHeaders?: Record<string, string>;
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
  /**
   * The flow ID
   * Provide this to Nylas support to help trace requests and responses
   */
  flowId?: string;
  /**
   * The response headers with camelCased keys (backwards compatible)
   */
  headers?: Record<string, string>;
  /**
   * The raw response headers with original dashed lowercase keys
   */
  rawHeaders?: Record<string, string>;
}

/**
 * Helper type for pagination
 */
export type ListResponseInnerType<T> =
  T extends NylasListResponse<infer R> ? R : never;
