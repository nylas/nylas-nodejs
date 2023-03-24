import { BaseResource } from './baseResource';
import { Overrides } from '../config';
import { List, Response } from '../schema/response';
import {
  CreateGrantRequestBody,
  Grant,
  GrantSchema,
  ListGrantsQueryParams,
  UpdateGrantRequestBody,
} from '../schema/grants';

interface ListGrantsParams {
  queryParams?: ListGrantsQueryParams;
}

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

  public find({
    grantId,
    overrides,
  }: FindGrantParams & Overrides): Promise<Response<Grant>> {
    return super._find({
      path: `/v3/grants/${grantId}`,
      responseSchema: GrantSchema,
      overrides,
    });
  }

  public create({
    requestBody,
    overrides,
  }: CreateGrantParams & Overrides): Promise<Response<Grant>> {
    return super._create({
      path: `/v3/grants`,
      requestBody,
      overrides,
      responseSchema: GrantSchema,
    });
  }

  public update({
    grantId,
    requestBody,
    overrides,
  }: UpdateGrantParams & Overrides): Promise<Response<Grant>> {
    return super._updatePatch({
      path: `/v3/grants/${grantId}`,
      requestBody,
      overrides,
      responseSchema: GrantSchema,
    });
  }

  public destroy({
    grantId,
    overrides,
  }: DestroyGrantParams & Overrides): Promise<null> {
    return super._destroy({
      path: `/v3/grants/${grantId}`,
      overrides,
    });
  }
}
