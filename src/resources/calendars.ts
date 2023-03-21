import { Overrides } from '../config';
import {
  Calendar,
  CalendarSchema,
  CreateCalenderRequestBody,
  ListCalenderParams,
  UpdateCalenderRequestBody,
} from '../schema/calendars';
import { ListResponse, Response } from '../schema/response';
import { BaseResource } from './baseResource';

interface FindCalendarParams {
  calendarId: string;
  grantId: string;
}
interface ListCalendersParams {
  grantId: string;
  queryParams?: ListCalenderParams;
}

interface CreateCalendarParams {
  grantId: string;
  requestBody: CreateCalenderRequestBody;
}

interface UpdateCalendarParams {
  calendarId: string;
  grantId: string;
  requestBody: UpdateCalenderRequestBody;
}

interface DestroyCalendarParams {
  grantId: string;
  eventId: string;
}

export class Calendars extends BaseResource {
  public async find({
    calendarId,
    grantId,
    overrides,
  }: FindCalendarParams & Overrides): Promise<Response<Calendar>> {
    const res = await this.apiClient.request<Response<Calendar>>(
      {
        method: 'GET',
        path: `/v3/grants/${grantId}/calendars/${calendarId}`,
        overrides,
      },
      {
        responseSchemaToValidate: CalendarSchema,
      }
    );

    return res;
  }

  public async list({
    grantId,
    queryParams,
    overrides,
  }: ListCalendersParams & Overrides): Promise<ListResponse<Calendar>> {
    const res = await this.apiClient.request<ListResponse<Calendar>>(
      {
        method: 'GET',
        path: `/v3/grants/${grantId}/calendars`,
        queryParams,
        overrides,
      },
      {
        responseSchemaToValidate: CalendarSchema,
      }
    );

    return res;
  }

  public async create({
    grantId,
    requestBody,
    overrides,
  }: CreateCalendarParams & Overrides): Promise<Response<Calendar>> {
    const res = await this.apiClient.request<Response<Calendar>>(
      {
        method: 'POST',
        path: `/v3/grants/${grantId}/calendars`,
        body: requestBody,
        overrides,
      },
      {
        responseSchemaToValidate: CalendarSchema,
      }
    );
    return res;
  }

  public async update({
    calendarId,
    grantId,
    requestBody,
    overrides,
  }: UpdateCalendarParams & Overrides): Promise<Response<Calendar>> {
    const res = await this.apiClient.request<Response<Calendar>>(
      {
        method: 'PUT',
        path: `/v3/grants/${grantId}/calendars/${calendarId}`,
        body: requestBody,
        overrides,
      },
      {
        responseSchemaToValidate: CalendarSchema,
      }
    );

    return res;
  }

  public async destroy({
    grantId,
    eventId,
    overrides,
  }: DestroyCalendarParams & Overrides): Promise<null> {
    const res = await this.apiClient.request<null>(
      {
        method: 'DELETE',
        path: `/v3/grants/${grantId}/events/${eventId}`,
        overrides,
      },
      {}
    );

    return res;
  }
}
