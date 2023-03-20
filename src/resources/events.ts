import {
  CreateEventQueryParams,
  CreateEventRequestBody,
  Event,
  EventResponseSchema,
} from '../schema/events';
import { BaseResource } from './baseResource';

export class Events extends BaseResource {
  public async find() {
    // TODO: Implement
  }

  public async list() {
    return null;
  }

  public async create(
    {
      queryParams,
      requestBody,
    }: {
      queryParams: CreateEventQueryParams;
      requestBody: CreateEventRequestBody;
    },
    otherStuff: any
  ) {
    const res = await this.apiClient.request<Event>({
      method: 'POST',
      path: '/events',
      queryParams,
      requestBody,
    });
    const validationRes = EventResponseSchema.safeParse(res);

    const { success } = validationRes;

    if (!success) {
      const { error } = validationRes;
      return error;
    }
    const { data } = validationRes;
    return data;
  }

  public async update() {
    // TODO: Implement
  }

  public async destroy() {
    // TODO: Implement
  }
}
