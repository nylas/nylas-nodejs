import { Overrides } from '../config';
import {
  CreateEventQueryParams,
  CreateEventRequest,
  DestroyEventQueryParams,
  Event,
  FindEventQueryParams,
  ListEventQueryParams,
  UpdateEventQueryParams,
  UpdateEventRequest,
} from '../models/events';
import {
  NylasDeleteResponse,
  NylasResponse,
  NylasListResponse,
} from '../models/response';
import { AsyncListResponse, Resource } from './resource';

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
  requestBody: CreateEventRequest;
}

interface UpdateEventParams {
  eventId: string;
  identifier: string;
  queryParams: UpdateEventQueryParams;
  requestBody: UpdateEventRequest;
}

interface DestroyEventParams {
  identifier: string;
  eventId: string;
  queryParams: DestroyEventQueryParams;
}

/**
 * Nylas Events API
 *
 * The Nylas Events API allows you to create, update, and delete events on user calendars.
 */
export class Events extends Resource {
  /**
   * Return all Events
   * @param identifier The identifier of the grant to act upon
   * @param queryParams The query parameters to include in the request
   * @param overrides Optional overrides to apply to this request
   * @return The list of Events
   */
  public list({
    identifier,
    queryParams,
    overrides,
  }: ListEventParams & Overrides): AsyncListResponse<NylasListResponse<Event>> {
    return super._list({
      queryParams,
      path: `/v3/grants/${identifier}/events`,
      overrides,
    });
  }

  /**
   * Return an Event
   * @param identifier The identifier of the grant to act upon
   * @param eventId The id of the Event to retrieve.
   * @param queryParams The query parameters to include in the request
   * @param overrides Optional overrides to apply to this request
   * @return The Event
   */
  public find({
    identifier,
    eventId,
    queryParams,
    overrides,
  }: FindEventParams & Overrides): Promise<NylasResponse<Event>> {
    return super._find({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      queryParams,
      overrides,
    });
  }

  /**
   * Create an Event
   * @param identifier The identifier of the grant to act upon
   * @param requestBody The values to create the Event with
   * @param queryParams The query parameters to include in the request
   * @param overrides Optional overrides to apply to this request
   * @return The created Event
   */
  public create({
    identifier,
    requestBody,
    queryParams,
    overrides,
  }: CreateEventParams & Overrides): Promise<NylasResponse<Event>> {
    return super._create({
      path: `/v3/grants/${identifier}/events`,
      queryParams,
      requestBody,
      overrides,
    });
  }

  /**
   * Update an Event
   * @param identifier The identifier of the grant to act upon
   * @param eventId The id of the Event to update.
   * @param requestBody The values to update the Event with
   * @param queryParams The query parameters to include in the request
   * @param overrides Optional overrides to apply to this request
   * @return The updated Event
   */
  public update({
    identifier,
    eventId,
    requestBody,
    queryParams,
    overrides,
  }: UpdateEventParams & Overrides): Promise<NylasResponse<Event>> {
    return super._update({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      queryParams,
      requestBody,
      overrides,
    });
  }

  /**
   * Delete an Event
   * @param identifier The identifier of the grant to act upon
   * @param eventId The id of the Event to delete.
   * @param queryParams The query parameters to include in the request
   * @param overrides Optional overrides to apply to this request
   * @return The deletion response
   */
  public destroy({
    identifier,
    eventId,
    queryParams,
    overrides,
  }: DestroyEventParams & Overrides): Promise<NylasDeleteResponse> {
    return super._destroy({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      queryParams,
      overrides,
    });
  }
}
