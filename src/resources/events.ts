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
import { List, Response } from '../schema/response';
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
  public list({
    identifier,
    queryParams,
    overrides,
  }: ListEventParams & Overrides): Promise<List<Event>> {
    return super._list({
      queryParams,
      path: `/v3/grants/${identifier}/events`,
      overrides,
      responseSchema: EventSchema,
    });
  }

  public find({
    identifier,
    eventId,
    overrides,
  }: FindEventParams & Overrides): Promise<Response<Event>> {
    return super._find({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      responseSchema: EventSchema,
      overrides,
    });
  }

  public async create({
    identifier,
    requestBody,
    overrides,
  }: CreateEventParams & Overrides): Promise<Response<Event>> {
    return super._create({
      path: `/v3/grants/${identifier}/events`,
      responseSchema: EventSchema,
      requestBody,
      overrides,
    });
  }

  public async update({
    identifier,
    eventId,
    requestBody,
    overrides,
  }: UpdateEventParams & Overrides): Promise<Response<Event>> {
    return super._update({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      responseSchema: EventSchema,
      requestBody,
      overrides,
    });
  }

  public async destroy({
    identifier,
    eventId,
    queryParams,
    overrides,
  }: DestroyEventParams & Overrides): Promise<null> {
    return super._destroy({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      queryParams,
      overrides,
    });
  }
}
