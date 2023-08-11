import { Overrides } from '../config';
import {
  Calendar,
  CreateCalenderRequestBody,
  ListCalendersQueryParams,
  UpdateCalenderRequestBody,
} from '../models/calendars';
import {
  NylasDeleteResponse,
  NylasResponse,
  NylasListResponse,
} from '../models/response';
import { Resource, AsyncListResponse } from './resource';

interface FindCalendarParams {
  calendarId: string;
  identifier: string;
}
interface ListCalendersParams {
  identifier: string;
}

interface CreateCalendarParams {
  identifier: string;
  requestBody: CreateCalenderRequestBody;
}

interface UpdateCalendarParams {
  calendarId: string;
  identifier: string;
  requestBody: UpdateCalenderRequestBody;
}

interface DestroyCalendarParams {
  identifier: string;
  calendarId: string;
}

type CalendarListParams = ListCalendersParams & Overrides;

/**
 * Nylas Calendar API
 *
 * The Nylas calendar API allows you to create new calendars or manage existing ones.
 * A calendar can be accessed by one, or several people, and can contain events.
 */
export class Calendars extends Resource {
  /**
   * Return all Calendars
   * @param identifier The identifier of the grant to act upon
   * @param queryParams The query parameters to include in the request
   * @param overrides Overrides to the request
   * @return A list of calendars
   */
  public list(
    { overrides, identifier }: CalendarListParams,
    queryParams?: ListCalendersQueryParams
  ): AsyncListResponse<NylasListResponse<Calendar>> {
    return super._list<NylasListResponse<Calendar>>({
      queryParams,
      overrides,
      path: `/v3/grants/${identifier}/calendars`,
    });
  }

  /**
   * Return a Calendar
   * @param identifier The identifier of the grant to act upon
   * @param calendarId The id of the Calendar to retrieve. Use "primary" to refer to the primary calendar associated with grant.
   * @param overrides Overrides to the request
   * @return The calendar
   */
  public find({
    calendarId,
    identifier,
    overrides,
  }: FindCalendarParams & Overrides): Promise<NylasResponse<Calendar>> {
    return super._find({
      path: `/v3/grants/${identifier}/calendars/${calendarId}`,
      overrides,
    });
  }

  /**
   * Create a Calendar
   * @param identifier The identifier of the grant to act upon
   * @param requestBody The values to create the Calendar with
   * @param overrides The created Calendar
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
   * @param identifier The identifier of the grant to act upon
   * @param calendarId The id of the Calendar to update. Use "primary" to refer to the primary calendar associated with grant.
   * @param requestBody The values to update the Calendar with
   * @param overrides Overrides to the request
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
   * @param identifier The identifier of the grant to act upon
   * @param calendarId The id of the Calendar to delete. Use "primary" to refer to the primary calendar associated with grant.
   * @param overrides Overrides to the request
   * @return The deleted Calendar
   */
  public destroy({
    identifier,
    calendarId,
    overrides,
  }: DestroyCalendarParams & Overrides): Promise<NylasDeleteResponse> {
    return super._destroy({
      path: `/v3/grants/${identifier}/calendars/${calendarId}`,
      overrides,
    });
  }
}
