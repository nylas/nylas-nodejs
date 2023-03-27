import { Overrides } from '../config';
import {
  CreateEventQueryParams,
  CreateEventRequestBody,
  DestroyEventQueryParams,
  Event,
  EventResponseSchema,
  ListEventQueryParams,
  UpdateEventQueryParams,
  UpdateEventRequestBody,
} from '../schema/events';
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
  // public  list({
  //   identifier,
  //   queryParams,
  //   overrides,
  // }: ListEventParams & Overrides): Promise<ListResponse<Event>> {
  //   const res =  this.apiClient.request<ListResponse<Event>>(
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

  public find({
    identifier,
    eventId,
    overrides,
  }: FindEventParams & Overrides): Promise<Event> {
    const res = this.apiClient.request<Event>(
      {
        method: 'GET',
        path: `/v3/grants/${identifier}/events/${eventId}`,
        overrides,
      },
      {
        responseSchema: EventResponseSchema,
      }
    );

    return res;
  }

  public create({
    identifier,
    requestBody,
    overrides,
  }: CreateEventParams & Overrides): Promise<Event> {
    const res = this.apiClient.request<Event>(
      {
        method: 'POST',
        path: `/v3/grants/${identifier}/events`,
        body: requestBody,
        overrides,
      },
      {
        responseSchema: EventResponseSchema,
      }
    );
    return res;
  }

  public update({
    identifier,
    eventId,
    requestBody,
    overrides,
  }: UpdateEventParams & Overrides): Promise<Event> {
    const res = this.apiClient.request<Event>(
      {
        method: 'PUT',
        path: `/v3/grants/${identifier}/events/${eventId}`,
        body: requestBody,
        overrides,
      },
      {
        responseSchema: EventResponseSchema,
      }
    );

    return res;
  }

  public destroy({
    identifier,
    eventId,
    queryParams,
    overrides,
  }: DestroyEventParams & Overrides): Promise<undefined> {
    const res = this.apiClient.request({
      method: 'DELETE',
      path: `/v3/grants/${identifier}/events/${eventId}`,
      queryParams,
      overrides,
    });

    return res;
  }
}
