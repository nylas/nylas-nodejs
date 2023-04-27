import { Overrides } from '../config';
import {
  CreateEventQueryParams,
  CreateEventRequestBody,
  DestroyEventQueryParams,
  Event,
  EventListResponseSchema,
  EventResponseSchema,
  FindEventQueryParams,
  ListEventQueryParams,
  UpdateEventQueryParams,
  UpdateEventRequestBody,
} from '../schema/events';
import { DeleteResponse, ItemResponse, ListResponse } from '../schema/response';
import { AsyncListResponse, BaseResource } from './baseResource';

interface FindEventParams {
  eventId: string;
  queryParams: FindEventQueryParams;
  identifier: string;
}
interface ListEventParams {
  identifier: string;
  queryParams: ListEventQueryParams;
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
  public list({
    identifier,
    queryParams,
    overrides,
  }: ListEventParams & Overrides): AsyncListResponse<ListResponse<Event>> {
    return super._list({
      queryParams,
      path: `/v3/grants/${identifier}/events`,
      overrides,
      responseSchema: EventListResponseSchema,
    });
  }

  public find({
    identifier,
    eventId,
    queryParams,
    overrides,
  }: FindEventParams & Overrides): Promise<ItemResponse<Event>> {
    return super._find({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      responseSchema: EventResponseSchema,
      queryParams,
      overrides,
    });
  }

  public create({
    identifier,
    requestBody,
    queryParams,
    overrides,
  }: CreateEventParams & Overrides): Promise<ItemResponse<Event>> {
    return super._create({
      path: `/v3/grants/${identifier}/events`,
      responseSchema: EventResponseSchema,
      queryParams,
      requestBody,
      overrides,
    });
  }

  public update({
    identifier,
    eventId,
    requestBody,
    queryParams,
    overrides,
  }: UpdateEventParams & Overrides): Promise<ItemResponse<Event>> {
    return super._update({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      responseSchema: EventResponseSchema,
      queryParams,
      requestBody,
      overrides,
    });
  }

  public destroy({
    identifier,
    eventId,
    queryParams,
    overrides,
  }: DestroyEventParams & Overrides): Promise<DeleteResponse> {
    return super._destroy({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      queryParams,
      overrides,
    });
  }
}
