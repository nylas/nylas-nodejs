import { BaseResource } from './baseResource';
import { Overrides } from '../config';
import { ItemResponse, ListResponse } from '../schema/response';
import {
  CreateGrantRequestBody,
  Grant,
  GrantListResponseSchema,
  GrantResponseSchema,
  ListGrantsQueryParams,
  UpdateGrantRequestBody,
} from '../schema/grants';

interface FindGrantParams {
  grantId: string;
}

interface CreateGrantParams {
  requestBody: CreateGrantRequestBody;
}

interface UpdateGrantParams {
  grantId: string;
  requestBody: UpdateGrantRequestBody;
}

interface DestroyGrantParams {
  grantId: string;
}

export class Grants extends BaseResource {
  public async list(
    { overrides }: Overrides = {},
    queryParams?: ListGrantsQueryParams
  ): Promise<ListResponse<Grant>> {
    return super._list<ListResponse<Grant>>({
      queryParams,
      path: `/v3/grants`,
      overrides,
      responseSchema: GrantListResponseSchema,
    });
  }

  public find({
    grantId,
    overrides,
  }: FindGrantParams & Overrides): Promise<ItemResponse<Grant>> {
    return super._find({
      path: `/v3/grants/${grantId}`,
      responseSchema: GrantResponseSchema,
      overrides,
    });
  }

  public create({
    requestBody,
    overrides,
  }: CreateGrantParams & Overrides): Promise<ItemResponse<Grant>> {
    return super._create({
      path: `/v3/grants`,
      requestBody,
      overrides,
      responseSchema: GrantResponseSchema,
    });
  }

  public update({
    grantId,
    requestBody,
    overrides,
  }: UpdateGrantParams & Overrides): Promise<ItemResponse<Grant>> {
    return super._updatePatch({
      path: `/v3/grants/${grantId}`,
      requestBody,
      overrides,
      responseSchema: GrantResponseSchema,
    });
  }

  public destroy({
    grantId,
    overrides,
  }: DestroyGrantParams & Overrides): Promise<undefined> {
    return super._destroy({
      path: `/v3/grants/${grantId}`,
      overrides,
    });
  }
}
