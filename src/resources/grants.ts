import { Resource } from './resource';
import { Overrides } from '../config';
import { DeleteResponse, Response, ListResponse } from '../models/response';
import {
  CreateGrantRequest,
  Grant,
  ListGrantsQueryParams,
  UpdateGrantRequest,
} from '../models/grants';

interface FindGrantParams {
  grantId: string;
}

interface CreateGrantParams {
  requestBody: CreateGrantRequest;
}

interface UpdateGrantParams {
  grantId: string;
  requestBody: UpdateGrantRequest;
}

interface DestroyGrantParams {
  grantId: string;
}

export class Grants extends Resource {
  public async list(
    { overrides }: Overrides = {},
    queryParams?: ListGrantsQueryParams
  ): Promise<ListResponse<Grant>> {
    return super._list<ListResponse<Grant>>({
      queryParams,
      path: `/v3/grants`,
      overrides,
    });
  }

  public find({
    grantId,
    overrides,
  }: FindGrantParams & Overrides): Promise<Response<Grant>> {
    return super._find({
      path: `/v3/grants/${grantId}`,
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
    });
  }

  public destroy({
    grantId,
    overrides,
  }: DestroyGrantParams & Overrides): Promise<DeleteResponse> {
    return super._destroy({
      path: `/v3/grants/${grantId}`,
      overrides,
    });
  }
}
