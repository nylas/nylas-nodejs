/* eslint-disable no-console */
import { ZodType } from 'zod';
import APIClient from '../apiClient';
import { OverridableNylasConfig } from '../config';
import { List, ListResponse } from '../schema/response';

export abstract class BaseResource {
  protected apiClient: APIClient;

  constructor(apiClient: APIClient) {
    this.apiClient = apiClient;
  }

  protected async _list<T>({
    queryParams,
    path,
    overrides,
    responseSchema,
  }: {
    queryParams?: Record<string, any>;
    path: string;
    overrides?: OverridableNylasConfig;
    responseSchema: ZodType<T>;
  }): Promise<List<T>> {
    const res = await this.apiClient.request<ListResponse<T>>(
      {
        method: 'GET',
        path,
        queryParams,
        overrides,
      },
      {
        responseSchema,
      }
    );

    const next = res.nextCursor
      ? async (): Promise<List<T>> =>
          this._list({
            path,
            queryParams: {
              ...queryParams,
              pageToken: res.nextCursor,
            },
            overrides,
            responseSchema,
          })
      : undefined;

    return {
      ...res,
      next,
    };
  }
}
