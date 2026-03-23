import { Overrides } from '../config.js';
import { NylasResponse } from '../models/response.js';
import {
  SchedulerAvailabilityResponse,
  GetSchedulerAvailabilityQueryParams,
} from '../models/scheduler.js';
import { Resource } from './resource.js';
import { makePathParams } from '../utils.js';

/**
 * The parameters for the {@link SchedulerAvailability.get} method
 * @property queryParams The query parameters to include in the request
 */
export interface GetSchedulerAvailabilityParams {
  queryParams: GetSchedulerAvailabilityQueryParams;
}

export class SchedulerAvailability extends Resource {
  /**
   * Get availability for a scheduling configuration
   * @return The availability response with time slots
   */
  public get({
    queryParams,
    overrides,
  }: GetSchedulerAvailabilityParams & Overrides): Promise<
    NylasResponse<SchedulerAvailabilityResponse>
  > {
    return super._find({
      path: makePathParams('/v3/scheduling/availability', {}),
      queryParams,
      overrides,
    });
  }
}
