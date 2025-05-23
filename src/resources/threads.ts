import {
  ListThreadsQueryParams,
  Thread,
  UpdateThreadRequest,
} from '../models/threads.js';
import { AsyncListResponse, Resource } from './resource.js';
import { Overrides } from '../config.js';
import {
  NylasBaseResponse,
  NylasListResponse,
  NylasResponse,
} from '../models/response.js';
import { makePathParams } from '../utils.js';

/**
 * The parameters for the {@link Threads.list} method
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
export interface ListThreadsParams {
  identifier: string;
  queryParams?: ListThreadsQueryParams;
}

/**
 * The parameters for the {@link Threads.find} method
 * @property identifier The identifier of the grant to act upon
 * @property threadId The id of the thread to retrieve.
 * @property queryParams The query parameters to include in the request
 */
export interface FindThreadParams {
  identifier: string;
  threadId: string;
}

/**
 * The parameters for the {@link Threads.update} method
 * @property identifier The identifier of the grant to act upon
 * @property threadId The id of the thread to update
 * @property requestBody The values to update the thread with
 */
export interface UpdateThreadParams {
  identifier: string;
  threadId: string;
  requestBody: UpdateThreadRequest;
}

/**
 * The parameters for the {@link Threads.destroy} method
 * @property identifier The identifier of the grant to act upon
 * @property threadId The id of the thread to delete
 */
export interface DestroyThreadParams {
  identifier: string;
  threadId: string;
}

/**
 * Nylas Threads API
 *
 * The Nylas Threads API allows you to list, find, update, and delete threads on user accounts.
 */
export class Threads extends Resource {
  /**
   * Return all Threads
   * @return A list of threads
   */
  public list({
    identifier,
    queryParams,
    overrides,
  }: ListThreadsParams & Overrides): AsyncListResponse<
    NylasListResponse<Thread>
  > {
    const modifiedQueryParams: Record<string, unknown> | undefined = queryParams
      ? { ...queryParams }
      : undefined;

    // Transform some query params that are arrays into comma-delimited strings
    if (modifiedQueryParams && queryParams) {
      if (Array.isArray(queryParams?.anyEmail)) {
        delete modifiedQueryParams.anyEmail;
        modifiedQueryParams['any_email'] = queryParams.anyEmail.join(',');
      }
    }

    return super._list<NylasListResponse<Thread>>({
      queryParams: modifiedQueryParams,
      overrides,
      path: makePathParams('/v3/grants/{identifier}/threads', { identifier }),
    });
  }

  /**
   * Return a Thread
   * @return The thread
   */
  public find({
    identifier,
    threadId,
    overrides,
  }: FindThreadParams & Overrides): Promise<NylasResponse<Thread>> {
    return super._find({
      path: makePathParams('/v3/grants/{identifier}/threads/{threadId}', {
        identifier,
        threadId,
      }),
      overrides,
    });
  }

  /**
   * Update a Thread
   * @return The updated thread
   */
  public update({
    identifier,
    threadId,
    requestBody,
    overrides,
  }: UpdateThreadParams & Overrides): Promise<NylasResponse<Thread>> {
    return super._update({
      path: makePathParams('/v3/grants/{identifier}/threads/{threadId}', {
        identifier,
        threadId,
      }),
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a Thread
   * @return The deleted thread
   */
  public destroy({
    identifier,
    threadId,
    overrides,
  }: DestroyThreadParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: makePathParams('/v3/grants/{identifier}/threads/{threadId}', {
        identifier,
        threadId,
      }),
      overrides,
    });
  }
}
