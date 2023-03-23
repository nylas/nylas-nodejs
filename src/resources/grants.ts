import { BaseResource } from './baseResource';
import { Overrides } from '../config';
import { List } from '../schema/response';
import { Grant, GrantSchema, ListGrantsQueryParams } from '../schema/grants';

interface ListGrantsParams {
  queryParams?: ListGrantsQueryParams;
}

export class Grants extends BaseResource {
  public async list({
    queryParams,
    overrides,
  }: ListGrantsParams & Overrides = {}): Promise<List<Grant>> {
    return super._list<Grant>({
      queryParams,
      path: `/v3/grants`,
      overrides,
      responseSchema: GrantSchema,
    });
  }
}
