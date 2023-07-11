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
