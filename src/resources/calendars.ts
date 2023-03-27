import { Overrides } from '../config';
import {
  Availability,
  AvailabilityResponseSchema,
  Calendar,
  CalendarListResponseSchema,
  CalendarResponseSchema,
  CreateCalenderRequestBody,
  GetAvailabilityRequestBody,
  ListCalendersQueryParams,
  UpdateCalenderRequestBody,
} from '../schema/calendars';
import { ItemResponse, ListResponse } from '../schema/response';
import { BaseResource, AsyncListResponse } from './baseResource';

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

interface GetAvailabilityParams {
  identifier: string;
  requestBody: GetAvailabilityRequestBody;
}

type CalendarListParams = ListCalendersParams & Overrides;

export class Calendars extends BaseResource {
  public getAvailability({
    identifier,
    requestBody,
    overrides,
  }: GetAvailabilityParams & Overrides): Promise<Availability> {
    return this.apiClient.request<Availability>(
      {
        method: 'POST',
        path: `/v3/grants/${identifier}/calendars/availability`,
        body: requestBody,
        overrides,
      },
      {
        responseSchema: AvailabilityResponseSchema,
      }
    );
  }

  public list(
    { overrides, identifier }: CalendarListParams,
    queryParams?: ListCalendersQueryParams
  ): AsyncListResponse<ListResponse<Calendar>> {
    return super._list<ListResponse<Calendar>>({
      queryParams,
      overrides,
      path: `/v3/grants/${identifier}/calendars`,
      responseSchema: CalendarListResponseSchema,
    });
  }

  public async find({
    calendarId,
    identifier,
    overrides,
  }: FindCalendarParams & Overrides): Promise<ItemResponse<Calendar>> {
    return this.apiClient.request<ItemResponse<Calendar>>(
      {
        method: 'GET',
        path: `/v3/grants/${identifier}/calendars/${calendarId}`,
        overrides,
      },
      {
        responseSchema: CalendarResponseSchema,
      }
    );
  }

  public async create({
    identifier,
    requestBody,
    overrides,
  }: CreateCalendarParams & Overrides): Promise<ItemResponse<Calendar>> {
    return this.apiClient.request<ItemResponse<Calendar>>(
      {
        method: 'POST',
        path: `/v3/grants/${identifier}/calendars`,
        body: requestBody,
        overrides,
      },
      {
        responseSchema: CalendarResponseSchema,
      }
    );
  }

  public async update({
    calendarId,
    identifier,
    requestBody,
    overrides,
  }: UpdateCalendarParams & Overrides): Promise<ItemResponse<Calendar>> {
    return this.apiClient.request<ItemResponse<Calendar>>(
      {
        method: 'PUT',
        path: `/v3/grants/${identifier}/calendars/${calendarId}`,
        body: requestBody,
        overrides,
      },
      {
        responseSchema: CalendarResponseSchema,
      }
    );
  }

  public async destroy({
    identifier,
    calendarId,
    overrides,
  }: DestroyCalendarParams & Overrides): Promise<undefined> {
    return this.apiClient.request({
      method: 'DELETE',
      path: `/v3/grants/${identifier}/calendars/${calendarId}`,
      overrides,
    });
  }
}
