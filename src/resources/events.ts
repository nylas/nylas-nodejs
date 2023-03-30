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
    overrides,
  }: FindEventParams & Overrides): Promise<ItemResponse<Event>> {
    return super._find({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      responseSchema: EventResponseSchema,
      overrides,
    });
  }

  public create({
    identifier,
    requestBody,
    overrides,
  }: CreateEventParams & Overrides): Promise<ItemResponse<Event>> {
    return super._create({
      path: `/v3/grants/${identifier}/events`,
      responseSchema: EventResponseSchema,
      requestBody,
      overrides,
    });
  }

  public update({
    identifier,
    eventId,
    requestBody,
    overrides,
  }: UpdateEventParams & Overrides): Promise<ItemResponse<Event>> {
    return super._update({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      responseSchema: EventResponseSchema,
      requestBody,
      overrides,
    });
  }

  public destroy({
    identifier,
    eventId,
    queryParams,
    overrides,
  }: DestroyEventParams & Overrides): Promise<undefined> {
    return super._destroy({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      queryParams,
      overrides,
    });
  }
}
