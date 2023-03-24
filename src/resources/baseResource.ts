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
  queryParams?: Record<string, any>;
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

  private payloadRequest<T>(
    method: 'POST' | 'PUT' | 'PATCH',
    { path, responseSchema, requestBody, overrides }: PayloadRequestParams<T>
  ): Promise<Response<T>> {
    return this.apiClient.request<Response<T>>(
      {
        method,
        path,
        body: requestBody,
        overrides,
      },
      {
        responseSchema,
      }
    );
  }

  protected _create<T>(params: PayloadRequestParams<T>): Promise<Response<T>> {
    return this.payloadRequest('POST', params);
  }

  protected _update<T>(params: PayloadRequestParams<T>): Promise<Response<T>> {
    return this.payloadRequest('PUT', params);
  }

  protected _updatePatch<T>(
    params: PayloadRequestParams<T>
  ): Promise<Response<T>> {
    return this.payloadRequest('PATCH', params);
  }

  protected _destroy({
    path,
    queryParams,
    overrides,
  }: DestroyRequestParams): Promise<null> {
    return this.apiClient.request<null>(
      {
        method: 'DELETE',
        path,
        queryParams,
        overrides,
      },
      {}
    );
  }
}
