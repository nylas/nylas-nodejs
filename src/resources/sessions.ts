import { Overrides } from '../config.js';
import { NylasBaseResponse, NylasResponse } from '../models/response.js';
import { CreateSessionRequest, Session } from '../models/scheduler.js';
import { Resource } from './resource.js';
import { makePathParams } from '../utils.js';
/**
 * The parameters for the {@link Sessions.create} method
 * @property identifier The identifier of the grant to act upon
 * @property requestBody The request body to create a session
 */
export interface CreateSessionParams {
  requestBody: CreateSessionRequest;
}

/**
 * The parameters for the {@link Sessions.destroy} method
 * @property identifier The identifier of the grant to act upon
 * @property sessionId The id of the Session to retrieve. Use "primary" to refer to the primary session associated with grant.
 */
export interface DestroySessionParams {
  sessionId: string;
}

export class Sessions extends Resource {
  /**
   * Create a Session
   * @return The created session
   */
  public create({
    requestBody,
    overrides,
  }: CreateSessionParams & Overrides): Promise<NylasResponse<Session>> {
    return super._create({
      path: makePathParams('/v3/scheduling/sessions', {}),
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a Session
   * @return The deleted Session
   */
  public destroy({
    sessionId,
    overrides,
  }: DestroySessionParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: makePathParams('/v3/scheduling/sessions/{sessionId}', {
        sessionId,
      }),
      overrides,
    });
  }
}
