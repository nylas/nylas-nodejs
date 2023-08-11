import { Overrides } from '../config';
import { Resource } from './resource';
import {
  GetAvailabilityRequest,
  GetAvailabilityResponse,
} from '../models/availability';

interface GetAvailabilityParams {
  requestBody: GetAvailabilityRequest;
}

export class Availability extends Resource {
  /**
   * Get Availability for a given account / accounts
   * @param requestBody The availability request
   * @param overrides Overrides to the request
   * @return The availability response
   */
  public getAvailability({
    requestBody,
    overrides,
  }: GetAvailabilityParams & Overrides): Promise<GetAvailabilityResponse> {
    return this.apiClient.request<GetAvailabilityResponse>({
      method: 'POST',
      path: `/v3/calendars/availability`,
      body: requestBody,
      overrides,
    });
  }
}
