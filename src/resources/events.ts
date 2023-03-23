import { Overrides } from '../config';
import {
  CreateEventQueryParams,
  CreateEventRequestBody,
  DestroyEventQueryParams,
  Event,
  EventSchema,
  ListEventQueryParams,
  UpdateEventQueryParams,
  UpdateEventRequestBody,
} from '../schema/events';
import { Response } from '../schema/response';
import { BaseResource } from './baseResource';

interface FindEventParams {
  eventId: string;
  identifier: string;
}
interface ListEventParams {
  identifier: string;
  queryParams?: ListEventQueryParams;
}

interface CreateEventParams {
  identifier: string;
  queryParams: CreateEventQueryParams;
  requestBody: CreateEventRequestBody;
}

interface UpdateEventParams {
  eventId: string;
  identifier: string;
  queryParams: UpdateEventQueryParams;
  requestBody: UpdateEventRequestBody;
}

interface DestroyEventParams {
  identifier: string;
  eventId: string;
  queryParams: DestroyEventQueryParams;
}
export class Events extends BaseResource {
  // public async list({
  //   identifier,
  //   queryParams,
  //   overrides,
  // }: ListEventParams & Overrides): Promise<ListResponse<Event>> {
  //   const res = await this.apiClient.request<ListResponse<Event>>(
  //     {
  //       method: 'GET',
  //       path: `/v3/grants/${identifier}/events`,
  //       queryParams,
  //       overrides,
  //     },
  //     {
  //       responseSchema: EventSchema,
  //     }
  //   );

  //   return res;
  // }

  public async find({
    identifier,
    eventId,
    overrides,
  }: FindEventParams & Overrides): Promise<Response<Event>> {
    const res = await this.apiClient.request<Response<Event>>(
      {
        method: 'GET',
        path: `/v3/grants/${identifier}/events/${eventId}`,
        overrides,
      },
      {
        responseSchema: EventSchema,
      }
    );

    return res;
  }

  public async create({
    identifier,
    requestBody,
    overrides,
  }: CreateEventParams & Overrides): Promise<Response<Event>> {
    const res = await this.apiClient.request<Response<Event>>(
      {
        method: 'POST',
        path: `/v3/grants/${identifier}/events`,
        body: requestBody,
        overrides,
      },
      {
        responseSchema: EventSchema,
      }
    );
    return res;
  }

  public async update({
    identifier,
    eventId,
    requestBody,
    overrides,
  }: UpdateEventParams & Overrides): Promise<Response<Event>> {
    const res = await this.apiClient.request<Response<Event>>(
      {
        method: 'PUT',
        path: `/v3/grants/${identifier}/events/${eventId}`,
        body: requestBody,
        overrides,
      },
      {
        responseSchema: EventSchema,
      }
    );

    return res;
  }

  public async destroy({
    identifier,
    eventId,
    queryParams,
    overrides,
  }: DestroyEventParams & Overrides): Promise<null> {
    const res = await this.apiClient.request<null>(
      {
        method: 'DELETE',
        path: `/v3/grants/${identifier}/events/${eventId}`,
        queryParams,
        overrides,
      },
      {}
    );

    return res;
  }
}
