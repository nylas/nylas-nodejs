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

interface FindRedirectUrisParams {
  redirectUriId: string;
}

interface CreateRedirectUrisParams {
  requestBody: CreateRedirectUriRequest;
}

interface UpdateRedirectUrisParams {
  redirectUriId: string;
  requestBody: UpdateRedirectUriRequest;
}

interface DestroyRedirectUrisParams {
  redirectUriId: string;
}

/**
 * A collection of redirect URI related API endpoints.
 *
 * These endpoints allows for the management of redirect URIs.
 */
export class RedirectUris extends Resource {
  /**
   * Return all Redirect URIs
   * @param overrides Overrides for the request
   * @return The list of Redirect URIs
   */
  public list({ overrides }: Overrides = {}): AsyncListResponse<
    NylasListResponse<RedirectUri>
  > {
    return super._list<NylasListResponse<RedirectUri>>({
      overrides,
      path: '/v3/applications/redirect-uris',
    });
  }

  /**
   * Return a Redirect URI
   * @param redirectUriId The id of the Redirect URI to retrieve.
   * @param overrides Overrides for the request
   * @return The Redirect URI
   */
  public find({
    redirectUriId,
    overrides,
  }: FindRedirectUrisParams & Overrides): Promise<NylasResponse<RedirectUri>> {
    return super._find({
      overrides,
      path: `/v3/applications/redirect-uris/${redirectUriId}`,
    });
  }

  /**
   * Create a Redirect URI
   * @param requestBody The values to create the Redirect URI with
   * @param overrides Overrides for the request
   * @return The created Redirect URI
   */
  public create({
    requestBody,
    overrides,
  }: CreateRedirectUrisParams & Overrides): Promise<
    NylasResponse<RedirectUri>
  > {
    return super._create({
      overrides,
      path: '/v3/applications/redirect-uris',
      requestBody,
    });
  }

  /**
   * Update a Redirect URI
   * @param redirectUriId The id of the Redirect URI to update.
   * @param requestBody The values to update the Redirect URI with
   * @param overrides Overrides for the request
   * @return The updated Redirect URI
   */
  public update({
    redirectUriId,
    requestBody,
    overrides,
  }: UpdateRedirectUrisParams & Overrides): Promise<
    NylasResponse<RedirectUri>
  > {
    return super._update({
      overrides,
      path: `/v3/applications/redirect-uris/${redirectUriId}`,
      requestBody,
    });
  }

  /**
   * Delete a Redirect URI
   * @param redirectUriId The id of the Redirect URI to delete.
   * @param overrides Overrides for the request
   * @return The deleted Redirect URI
   */
  public destroy({
    redirectUriId,
    overrides,
  }: DestroyRedirectUrisParams & Overrides): Promise<
    NylasResponse<NylasDeleteResponse>
  > {
    return super._destroy({
      overrides,
      path: `/v1/redirect_uris/${redirectUriId}`,
    });
  }
}
