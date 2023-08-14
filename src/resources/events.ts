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

/**
 * @property eventId The id of the Event to retrieve.
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
interface FindEventParams {
  identifier: string;
  eventId: string;
  queryParams: FindEventQueryParams;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
interface ListEventParams {
  identifier: string;
  queryParams: ListEventQueryParams;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 * @property requestBody The values to create the Event with
 */
interface CreateEventParams {
  identifier: string;
  requestBody: CreateEventRequest;
  queryParams: CreateEventQueryParams;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property eventId The id of the Event to retrieve.
 * @property requestBody The values to update the Event with
 * @property queryParams The query parameters to include in the request
 */
interface UpdateEventParams {
  identifier: string;
  eventId: string;
  requestBody: UpdateEventRequest;
  queryParams: UpdateEventQueryParams;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property eventId The id of the Event to retrieve.
 * @property queryParams The query parameters to include in the request
 */
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
