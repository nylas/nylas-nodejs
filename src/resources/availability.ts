import { Overrides } from '../config';
import { Resource } from './resource';
import { GetAvailabilityRequest } from '../models/availability';

interface GetAvailabilityParams {
  requestBody: GetAvailabilityRequest;
}

export class Availability extends Resource {
  public getAvailability({
    requestBody,
    overrides,
  }: GetAvailabilityParams & Overrides): Promise<Availability> {
    return this.apiClient.request<Availability>({
      method: 'POST',
      path: `/v3/calendars/availability`,
      body: requestBody,
      overrides,
    });
  }
}
