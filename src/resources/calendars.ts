import { Overrides } from '../config';
import {
  Availability,
  AvailabilitySchema,
  Calendar,
  CalendarSchema,
  CreateCalenderRequestBody,
  GetAvailabilityRequestBody,
  ListCalendersQueryParams,
  UpdateCalenderRequestBody,
} from '../schema/calendars';
import { List, Response } from '../schema/response';
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
  calendarId: string;
}

interface GetAvailabilityParams {
  identifier: string;
  requestBody: GetAvailabilityRequestBody;
}

export class Calendars extends BaseResource {
  public async getAvailability({
    identifier,
    requestBody,
    overrides,
  }: GetAvailabilityParams & Overrides): Promise<Response<Availability>> {
    const res = await this.apiClient.request<Response<Availability>>(
      {
        method: 'POST',
        path: `/v3/grants/${identifier}/calendars/availability`,
        body: requestBody,
        overrides,
      },
      {
        responseSchema: AvailabilitySchema,
      }
    );

    return res;
  }

  public async list({
    identifier,
    queryParams,
    overrides,
  }: ListCalendersParams & Overrides): Promise<List<Calendar>> {
    return super._list<Calendar>({
      queryParams,
      overrides,
      path: `/v3/grants/${identifier}/calendars`,
      responseSchema: CalendarSchema,
    });
  }

  public find({
    calendarId,
    identifier,
    overrides,
  }: FindCalendarParams & Overrides): Promise<Response<Calendar>> {
    return super._find({
      path: `/v3/grants/${identifier}/calendars/${calendarId}`,
      responseSchema: CalendarSchema,
      overrides,
    });
  }

  public create({
    identifier,
    requestBody,
    overrides,
  }: CreateCalendarParams & Overrides): Promise<Response<Calendar>> {
    return super._create({
      path: `/v3/grants/${identifier}/calendars`,
      responseSchema: CalendarSchema,
      requestBody,
      overrides,
    });
  }

  public update({
    calendarId,
    identifier,
    requestBody,
    overrides,
  }: UpdateCalendarParams & Overrides): Promise<Response<Calendar>> {
    return super._update({
      path: `/v3/grants/${identifier}/calendars/${calendarId}`,
      responseSchema: CalendarSchema,
      requestBody,
      overrides,
    });
  }

  public destroy({
    identifier,
    calendarId,
    overrides,
  }: DestroyCalendarParams & Overrides): Promise<null> {
    return super._destroy({
      path: `/v3/grants/${identifier}/calendars/${calendarId}`,
      overrides,
    });
  }
}
