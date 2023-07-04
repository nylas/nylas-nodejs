import { Overrides } from '../config';
import { BaseResource } from './baseResource';
import { GetAvailabilityRequest } from '../schema/availability';

interface GetAvailabilityParams {
  requestBody: GetAvailabilityRequest;
}

export class Availability extends BaseResource {
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
