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

/**
 * Interface representing a response to a delete request.
 */
export interface NylasDeleteResponse {
  requestId: string;
}

/**
 * Helper type for pagination
 */
export type ListResponseInnerType<T> = T extends NylasListResponse<infer R>
  ? R
  : never;
