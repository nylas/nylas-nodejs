import { Overrides } from '../config';
import {
  Calendar,
  CreateCalenderRequestBody,
  ListCalendersQueryParams,
  UpdateCalenderRequestBody,
} from '../schema/calendars';
import { DeleteResponse, ItemResponse, ListResponse } from '../schema/response';
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

export class Calendars extends Resource {
  public list(
    { overrides, identifier }: CalendarListParams,
    queryParams?: ListCalendersQueryParams
  ): AsyncListResponse<ListResponse<Calendar>> {
    return super._list<ListResponse<Calendar>>({
      queryParams,
      overrides,
      path: `/v3/grants/${identifier}/calendars`,
    });
  }

  public find({
    calendarId,
    identifier,
    overrides,
  }: FindCalendarParams & Overrides): Promise<ItemResponse<Calendar>> {
    return super._find({
      path: `/v3/grants/${identifier}/calendars/${calendarId}`,
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
      requestBody,
      overrides,
    });
  }

  public destroy({
    identifier,
    calendarId,
    overrides,
  }: DestroyCalendarParams & Overrides): Promise<DeleteResponse> {
    return super._destroy({
      path: `/v3/grants/${identifier}/calendars/${calendarId}`,
      overrides,
    });
  }
}
