import { Overrides } from '../config.js';
import {
  Calendar,
  CreateCalenderRequest,
  ListCalendersQueryParams,
  UpdateCalenderRequest,
} from '../models/calendars.js';
import {
  NylasBaseResponse,
  NylasResponse,
  NylasListResponse,
} from '../models/response.js';
import { Resource, AsyncListResponse } from './resource.js';
import {
  GetAvailabilityRequest,
  GetAvailabilityResponse,
} from '../models/availability.js';
import { GetFreeBusyRequest, GetFreeBusyResponse } from '../models/freeBusy.js';

/**
 * The parameters for the {@link Calendars.find} method
 * @property calendarId The id of the Calendar to retrieve. Use "primary" to refer to the primary calendar associated with grant.
 * @property identifier The identifier of the grant to act upon
 */
export interface FindCalendarParams {
  identifier: string;
  calendarId: string;
}

/**
 * The parameters for the {@link Calendars.list} method
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
export interface ListCalendersParams {
  identifier: string;
  queryParams?: ListCalendersQueryParams;
}

/**
 * The parameters for the {@link Calendars.create} method
 * @property identifier The identifier of the grant to act upon
 * @property requestBody The request body to create a calendar
 */
export interface CreateCalendarParams {
  identifier: string;
  requestBody: CreateCalenderRequest;
}

/**
 * The parameters for the {@link Calendars.update} method
 * @property identifier The identifier of the grant to act upon
 * @property calendarId The id of the Calendar to retrieve. Use "primary" to refer to the primary calendar associated with grant.
 */
export interface UpdateCalendarParams {
  identifier: string;
  calendarId: string;
  requestBody: UpdateCalenderRequest;
}

/**
 * The parameters for the {@link Calendars.destroy} method
 * @property identifier The identifier of the grant to act upon
 * @property calendarId The id of the Calendar to retrieve. Use "primary" to refer to the primary calendar associated with grant.
 */
export interface DestroyCalendarParams {
  identifier: string;
  calendarId: string;
}

/**
 * The parameters for the {@link Calendars.getAvailability} method
 * @property requestBody The availability request
 */
export interface GetAvailabilityParams {
  requestBody: GetAvailabilityRequest;
}

/**
 * The parameters for the {@link Calendars.getFreeBusy} method
 * @property identifier The identifier of the grant to act upon
 * @property requestBody The free busy request
 */
export interface GetFreeBusyParams {
  identifier: string;
  requestBody: GetFreeBusyRequest;
}

/**
 * Nylas Calendar API
 *
 * The Nylas calendar API allows you to create new calendars or manage existing ones.
 * A calendar can be accessed by one, or several people, and can contain events.
 */
export class Calendars extends Resource {
  /**
   * Return all Calendars
   * @return A list of calendars
   */
  public list({
    identifier,
    queryParams,
    overrides,
  }: ListCalendersParams &
    ListCalendersQueryParams &
    Overrides): AsyncListResponse<NylasListResponse<Calendar>> {
    return super._list<NylasListResponse<Calendar>>({
      queryParams,
      overrides,
      path: `/v3/grants/${identifier}/calendars`,
    });
  }

  /**
   * Return a Calendar
   * @return The calendar
   */
  public find({
    identifier,
    calendarId,
    overrides,
  }: FindCalendarParams & Overrides): Promise<NylasResponse<Calendar>> {
    return super._find({
      path: `/v3/grants/${identifier}/calendars/${calendarId}`,
      overrides,
    });
  }

  /**
   * Create a Calendar
   * @return The created calendar
   */
  public create({
    identifier,
    requestBody,
    overrides,
  }: CreateCalendarParams & Overrides): Promise<NylasResponse<Calendar>> {
    return super._create({
      path: `/v3/grants/${identifier}/calendars`,
      requestBody,
      overrides,
    });
  }

  /**
   * Update a Calendar
   * @return The updated Calendar
   */
  public update({
    calendarId,
    identifier,
    requestBody,
    overrides,
  }: UpdateCalendarParams & Overrides): Promise<NylasResponse<Calendar>> {
    return super._update({
      path: `/v3/grants/${identifier}/calendars/${calendarId}`,
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a Calendar
   * @return The deleted Calendar
   */
  public destroy({
    identifier,
    calendarId,
    overrides,
  }: DestroyCalendarParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: `/v3/grants/${identifier}/calendars/${calendarId}`,
      overrides,
    });
  }

  /**
   * Get Availability for a given account / accounts
   * @return The availability response
   */
  public getAvailability({
    requestBody,
    overrides,
  }: GetAvailabilityParams & Overrides): Promise<
    NylasResponse<GetAvailabilityResponse>
  > {
    return this.apiClient.request<NylasResponse<GetAvailabilityResponse>>({
      method: 'POST',
      path: `/v3/calendars/availability`,
      body: requestBody,
      overrides,
    });
  }

  /**
   * Get the free/busy schedule for a list of email addresses
   * @return The free/busy response
   */
  public getFreeBusy({
    identifier,
    requestBody,
    overrides,
  }: GetFreeBusyParams & Overrides): Promise<
    NylasResponse<GetFreeBusyResponse[]>
  > {
    return this.apiClient.request<NylasResponse<GetFreeBusyResponse[]>>({
      method: 'POST',
      path: `/v3/grants/${identifier}/calendars/free-busy`,
      body: requestBody,
      overrides,
    });
  }
}
