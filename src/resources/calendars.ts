import { Overrides } from '../config';
import {
  Calendar,
  CalendarSchema,
  CreateCalenderRequestBody,
  ListCalendersQueryParams,
  UpdateCalenderRequestBody,
} from '../schema/calendars';
import { ListResponse, Response } from '../schema/response';
import { BaseResource } from './baseResource';

interface FindCalendarParams {
  calendarId: string;
  identifier: string;
}
interface ListCalendersParams {
  identifier: string;
  queryParams?: ListCalendersQueryParams;
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
  eventId: string;
}

export class Calendars extends BaseResource {
  public async find({
    calendarId,
    identifier,
    overrides,
  }: FindCalendarParams & Overrides): Promise<Response<Calendar>> {
    const res = await this.apiClient.request<Response<Calendar>>(
      {
        method: 'GET',
        path: `/v3/grants/${identifier}/calendars/${calendarId}`,
        overrides,
      },
      {
        responseSchema: CalendarSchema,
      }
    );

    return res;
  }

  public async list({
    identifier,
    queryParams,
    overrides,
  }: ListCalendersParams & Overrides): Promise<ListResponse<Calendar>> {
    const res = await this.apiClient.request<ListResponse<Calendar>>(
      {
        method: 'GET',
        path: `/v3/grants/${identifier}/calendars`,
        queryParams,
        overrides,
      },
      {
        responseSchema: CalendarSchema,
      }
    );

    return res;
  }

  public async create({
    identifier,
    requestBody,
    overrides,
  }: CreateCalendarParams & Overrides): Promise<Response<Calendar>> {
    const res = await this.apiClient.request<Response<Calendar>>(
      {
        method: 'POST',
        path: `/v3/grants/${identifier}/calendars`,
        body: requestBody,
        overrides,
      },
      {
        responseSchema: CalendarSchema,
      }
    );
    return res;
  }

  public async update({
    calendarId,
    identifier,
    requestBody,
    overrides,
  }: UpdateCalendarParams & Overrides): Promise<Response<Calendar>> {
    const res = await this.apiClient.request<Response<Calendar>>(
      {
        method: 'PUT',
        path: `/v3/grants/${identifier}/calendars/${calendarId}`,
        body: requestBody,
        overrides,
      },
      {
        responseSchema: CalendarSchema,
      }
    );

    return res;
  }

  public async destroy({
    identifier,
    eventId,
    overrides,
  }: DestroyCalendarParams & Overrides): Promise<null> {
    const res = await this.apiClient.request<null>(
      {
        method: 'DELETE',
        path: `/v3/grants/${identifier}/events/${eventId}`,
        overrides,
      },
      {}
    );

    return res;
  }
}
