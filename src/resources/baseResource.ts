/* eslint-disable no-console */
import { ZodType } from 'zod';
import APIClient from '../apiClient';
import { OverridableNylasConfig } from '../config';
import { List, ListResponse, Response } from '../schema/response';

interface ListRequestParams<T> {
  path: string;
  responseSchema: ZodType<T>;
  overrides?: OverridableNylasConfig;
  queryParams?: Record<string, any>;
}

interface FindRequestParams<T> {
  path: string;
  responseSchema: ZodType<T>;
  overrides?: OverridableNylasConfig;
}

interface PayloadRequestParams<T> {
  path: string;
  responseSchema: ZodType<T>;
  requestBody: Record<string, any>;
  overrides?: OverridableNylasConfig;
}

interface DestroyRequestParams {
  path: string;
  overrides?: OverridableNylasConfig;
}

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
  }: ListRequestParams<T>): Promise<List<T>> {
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

  protected _find<T>({
    path,
    responseSchema,
    overrides,
  }: FindRequestParams<T>): Promise<Response<T>> {
    return this.apiClient.request<Response<T>>(
      {
        method: 'GET',
        path,
        overrides,
      },
      {
        responseSchema,
      }
    );
  }

  protected _create<T>({
    path,
    responseSchema,
    requestBody,
    overrides,
  }: PayloadRequestParams<T>): Promise<Response<T>> {
    return this.apiClient.request<Response<T>>(
      {
        method: 'POST',
        path,
        body: requestBody,
        overrides,
      },
      {
        responseSchema,
      }
    );
  }

  protected _update<T>({
    path,
    responseSchema,
    requestBody,
    overrides,
  }: PayloadRequestParams<T>): Promise<Response<T>> {
    return this.apiClient.request<Response<T>>(
      {
        method: 'PUT',
        path,
        body: requestBody,
        overrides,
      },
      {
        responseSchema,
      }
    );
  }

  protected _destroy({ path, overrides }: DestroyRequestParams): Promise<null> {
    return this.apiClient.request<null>(
      {
        method: 'DELETE',
        path,
        overrides,
      },
      {}
    );
  }
}
