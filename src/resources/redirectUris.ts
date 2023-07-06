import { AsyncListResponse, Resource } from './resource';
import {
  NylasDeleteResponse,
  NylasResponse,
  NylasListResponse,
} from '../models/response';
import {
  CreateRedirectUriRequest,
  RedirectUri,
  UpdateRedirectUriRequest,
} from '../models/redirectUri';
import { Overrides } from '../config';

export class RedirectUris extends Resource {
  public list({ overrides }: Overrides = {}): AsyncListResponse<
    NylasListResponse<RedirectUri>
  > {
    return super._list<NylasListResponse<RedirectUri>>({
      overrides,
      path: '/v3/applications/redirect-uris',
    });
  }

  public find(redirectUriId: string): Promise<NylasResponse<RedirectUris>> {
    return super._find({
      path: `/v3/applications/redirect-uris/${redirectUriId}`,
    });
  }

  public create(
    requestBody: CreateRedirectUriRequest
  ): Promise<NylasResponse<RedirectUris>> {
    return super._create({
      path: '/v3/applications/redirect-uris',
      requestBody,
    });
  }

  public update(
    redirectUriId: string,
    requestBody: UpdateRedirectUriRequest
  ): Promise<NylasResponse<RedirectUris>> {
    return super._update({
      path: `/v3/applications/redirect-uris/${redirectUriId}`,
      requestBody,
    });
  }

  public destroy(
    redirectUriId: string
  ): Promise<NylasResponse<NylasDeleteResponse>> {
    return super._destroy({
      path: `/v1/redirect_uris/${redirectUriId}`,
    });
  }
}
