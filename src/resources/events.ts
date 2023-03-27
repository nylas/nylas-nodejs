import { Overrides } from '../config';
import {
  CreateEventQueryParams,
  CreateEventRequestBody,
  DestroyEventQueryParams,
  Event,
  EventListResponseSchema,
  EventResponseSchema,
  ListEventQueryParams,
  UpdateEventQueryParams,
  UpdateEventRequestBody,
} from '../schema/events';
import { ItemResponse, ListResponse } from '../schema/response';
import { AsyncListResponse, BaseResource } from './baseResource';

interface FindEventParams {
  eventId: string;
  identifier: string;
}
interface ListEventParams {
  identifier: string;
}

type ListEventsParams = ListEventParams & Overrides;

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
  public list(
    { identifier, overrides }: ListEventsParams,
    queryParams: ListEventQueryParams
  ): AsyncListResponse<ListResponse<Event>> {
    const res = super._list<ListResponse<Event>>({
      path: `/v3/grants/${identifier}/events`,
      queryParams,
      overrides,
      responseSchema: EventListResponseSchema,
    });

    return res;
  }

  public find({
    identifier,
    eventId,
    overrides,
  }: FindEventParams & Overrides): Promise<ItemResponse<Event>> {
    const res = this.apiClient.request<ItemResponse<Event>>(
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
  }: CreateEventParams & Overrides): Promise<ItemResponse<Event>> {
    const res = this.apiClient.request<ItemResponse<Event>>(
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
  }: UpdateEventParams & Overrides): Promise<ItemResponse<Event>> {
    const res = this.apiClient.request<ItemResponse<Event>>(
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
