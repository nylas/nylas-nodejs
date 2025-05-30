import { Overrides } from '../config.js';
import {
  CreateEventQueryParams,
  CreateEventRequest,
  DestroyEventQueryParams,
  Event,
  FindEventQueryParams,
  ListImportEventQueryParams,
  ListEventQueryParams,
  SendRsvpQueryParams,
  SendRsvpRequest,
  SendRsvpResponse,
  UpdateEventQueryParams,
  UpdateEventRequest,
} from '../models/events.js';
import {
  NylasBaseResponse,
  NylasResponse,
  NylasListResponse,
} from '../models/response.js';
import { AsyncListResponse, Resource } from './resource.js';
import { makePathParams } from '../utils.js';

/**
 * @property eventId The id of the Event to retrieve.
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
export interface FindEventParams {
  identifier: string;
  eventId: string;
  queryParams: FindEventQueryParams;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
export interface ListEventParams {
  identifier: string;
  queryParams: ListEventQueryParams;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 * @property requestBody The values to create the Event with
 */
export interface CreateEventParams {
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
export interface UpdateEventParams {
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
export interface DestroyEventParams {
  identifier: string;
  eventId: string;
  queryParams: DestroyEventQueryParams;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
export interface ListImportEventParams {
  identifier: string;
  queryParams: ListImportEventQueryParams;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property eventId The id of the Event to update.
 * @property queryParams The query parameters to include in the request
 * @property requestBody The values to send the RSVP with
 */
interface SendRsvpParams {
  identifier: string;
  eventId: string;
  queryParams: SendRsvpQueryParams;
  requestBody: SendRsvpRequest;
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
      path: makePathParams('/v3/grants/{identifier}/events', { identifier }),
      overrides,
    });
  }

  /**
   * (Beta) Import events from a calendar within a given time frame
   * This is useful when you want to import, store, and synchronize events from the time frame to your application
   * @return The list of imported Events
   */
  public listImportEvents({
    identifier,
    queryParams,
    overrides,
  }: ListImportEventParams & Overrides): AsyncListResponse<
    NylasListResponse<Event>
  > {
    return super._list({
      queryParams,
      path: makePathParams('/v3/grants/{identifier}/events/import', {
        identifier,
      }),
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
      path: makePathParams('/v3/grants/{identifier}/events/{eventId}', {
        identifier,
        eventId,
      }),
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
      path: makePathParams('/v3/grants/{identifier}/events', { identifier }),
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
      path: makePathParams('/v3/grants/{identifier}/events/{eventId}', {
        identifier,
        eventId,
      }),
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
  }: DestroyEventParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: makePathParams('/v3/grants/{identifier}/events/{eventId}', {
        identifier,
        eventId,
      }),
      queryParams,
      overrides,
    });
  }

  /**
   * Send RSVP. Allows users to respond to events they have been added to as an attendee.
   * You cannot send RSVP as an event owner/organizer.
   * You cannot directly update events as an invitee, since you are not the owner/organizer.
   * @return The send-rsvp response
   */
  public sendRsvp({
    identifier,
    eventId,
    requestBody,
    queryParams,
    overrides,
  }: SendRsvpParams & Overrides): Promise<SendRsvpResponse> {
    return this.apiClient.request<SendRsvpResponse>({
      method: 'POST',
      path: makePathParams(
        '/v3/grants/{identifier}/events/{eventId}/send-rsvp',
        { identifier, eventId }
      ),
      queryParams,
      body: requestBody,
      overrides,
    });
  }
}
