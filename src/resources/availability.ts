import { Overrides } from '../config.js';
import { NylasResponse } from '../models/response.js';
import {
  AvailabilityResponse,
  GetAvailabilityQueryParams,
} from '../models/scheduler.js';
import { Resource } from './resource.js';
import { makePathParams } from '../utils.js';

/**
 * The parameters for the {@link SchedulerAvailability.list} method
 * @property queryParams The query parameters to include in the request
 */
export interface GetAvailabilityParams {
  queryParams: GetAvailabilityQueryParams;
}

export class SchedulerAvailability extends Resource {
  /**
   * Get availability for a scheduling configuration
   * @return The availability response with time slots
   */
  public list({
    queryParams,
    overrides,
  }: GetAvailabilityParams &
    Overrides): Promise<NylasResponse<AvailabilityResponse>> {
    return super._find({
      path: makePathParams('/v3/scheduling/availability', {}),
      queryParams,
      overrides,
    });
  }
}
