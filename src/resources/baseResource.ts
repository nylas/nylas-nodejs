import { ZodType } from 'zod';
import APIClient from '../apiClient';
import { OverridableNylasConfig } from '../config';
import { ListQueryParams } from '../schema/request';
import { ListResponse, ListResponseInnerType } from '../schema/response';

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

export interface ListParams<T> {
  queryParams?: ListQueryParams;
  path: string;
  overrides?: OverridableNylasConfig;
  responseSchema: ZodType<T>;
  useGenerator?: boolean; // Add this line
}

type List<T> = ListResponse<ListResponseInnerType<T>>;
export class BaseResource {
  protected apiClient: APIClient;

  constructor(apiClient: APIClient) {
    this.apiClient = apiClient;
  }

  private async fetchList<T extends List<T>>({
    queryParams,
    path,
    overrides,
    responseSchema,
  }: ListParams<T>): Promise<T> {
    const res = await this.apiClient.request<T>(
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

    if (queryParams?.limit) {
      let entriesRemaining = queryParams.limit;

      while (res.data.length != queryParams.limit) {
        entriesRemaining = queryParams.limit - res.data.length;

        if (!res.nextCursor) {
          break;
        }

        const nextRes = await this.apiClient.request<T>(
          {
            method: 'GET',
            path,
            queryParams: {
              ...queryParams,
              limit: entriesRemaining,
              pageToken: res.nextCursor,
            },
            overrides,
          },
          {
            responseSchema,
          }
        );

        res.data = res.data.concat(nextRes.data);
        res.requestId = nextRes.requestId;
        res.nextCursor = nextRes.nextCursor;
      }
    }

    return res;
  }

  private async *listIterator<T extends List<T>>(
    listParams: ListParams<T>
  ): AsyncGenerator<T, undefined> {
    const first = await this.fetchList(listParams);

    yield first;

    let pageToken = first.nextCursor;

    while (pageToken) {
      const res = await this.fetchList({
        ...listParams,
        queryParams: pageToken
          ? {
              ...listParams.queryParams,
              pageToken,
            }
          : listParams.queryParams,
      });

      yield res;

      pageToken = res.nextCursor;
    }

    return undefined;
  }

  protected _list<T extends List<T>>(
    listParams: ListParams<T>
  ): AsyncListResponse<T> {
    const iterator = this.listIterator(listParams);
    const first = iterator.next().then(
      res =>
        ({
          ...res.value,
          next: iterator.next.bind(iterator),
        } as ListYieldReturn<T>)
    );

    const response = Object.assign(first, {
      [Symbol.asyncIterator]: this.listIterator.bind(
        this,
        listParams
      ) as () => AsyncGenerator<T, undefined>,
    });

    return response;
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
  }: DestroyRequestParams): Promise<undefined> {
    return this.apiClient.request({
      method: 'DELETE',
      path,
      queryParams,
      overrides,
    });
  }
}

type ListYieldReturn<T> = T & {
  next: () => Promise<IteratorResult<T, undefined>>;
};

export interface AsyncListResponse<T> extends Promise<ListYieldReturn<T>> {
  [Symbol.asyncIterator](): AsyncGenerator<T, undefined>;
}
