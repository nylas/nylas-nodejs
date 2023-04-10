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

  public find({
    calendarId,
    identifier,
    overrides,
  }: FindCalendarParams & Overrides): Promise<ItemResponse<Calendar>> {
    return super._find({
      path: `/v3/grants/${identifier}/calendars/${calendarId}`,
      responseSchema: CalendarResponseSchema,
      overrides,
    });
  }

  public create({
    identifier,
    requestBody,
    overrides,
  }: CreateCalendarParams & Overrides): Promise<ItemResponse<Calendar>> {
    return super._create({
      path: `/v3/grants/${identifier}/calendars`,
      responseSchema: CalendarResponseSchema,
      requestBody,
      overrides,
    });
  }

  public update({
    calendarId,
    identifier,
    requestBody,
    overrides,
  }: UpdateCalendarParams & Overrides): Promise<ItemResponse<Calendar>> {
    return super._update({
      path: `/v3/grants/${identifier}/calendars/${calendarId}`,
      responseSchema: CalendarResponseSchema,
      requestBody,
      overrides,
    });
  }

  public destroy({
    identifier,
    calendarId,
    overrides,
  }: DestroyCalendarParams & Overrides): Promise<undefined> {
    return super._destroy({
      path: `/v3/grants/${identifier}/calendars/${calendarId}`,
      overrides,
    });
  }
}
