import { AsyncListResponse, Resource } from './resource.js';
import {
  Credential,
  CreateCredentialRequest,
  ListCredentialsQueryParams,
  UpdateCredentialRequest,
} from '../models/credentials.js';
import { Overrides } from '../config.js';
import {
  NylasDeleteResponse,
  NylasListResponse,
  NylasResponse,
} from '../models/response.js';
import { Provider } from '../models/auth.js';

/**
 * The parameters for the {@link Credentials.find} method
 * @property provider The provider associated to the credential to retrieve.
 * @property credentialsId The id of the credentials to retrieve.
 */
interface FindCredentialParams {
  provider: Provider;
  credentialsId: string;
}

/**
 * The parameters for the {@link Credentials.list} method
 * @property provider The provider associated to the credential to list from.
 * @property queryParams The query parameters to include in the request
 */
interface ListCredentialsParams {
  provider: Provider;
  queryParams?: ListCredentialsQueryParams;
}

/**
 * The parameters for the {@link Credentials.create} method
 * @property provider The provider associated to the credential being created.
 * @property requestBody The request body to create a credential
 */
interface CreateCredentialParams {
  provider: Provider;
  requestBody: CreateCredentialRequest;
}

/**
 * The parameters for the {@link Credentials.update} method
 * @property provider The provider associated to the credential to update from.
 * @property requestBody The request body to create a credential
 * @property credentialsId The id of the credentials to update.
 */
interface UpdateCredentialParams {
  provider: Provider;
  credentialsId: string;
  requestBody: UpdateCredentialRequest;
}

/**
 * The parameters for the {@link Credentials.destroy} method
 * @property provider The provider associated to the credential to delete from.
 * @property credentialsId The id of the credentials to delete.
 */
interface DestroyCredentialParams {
  provider: string;
  credentialsId: string;
}

export class Credentials extends Resource {
  /**
   * Return all credentials
   * @return A list of credentials
   */
  public list({
    provider,
    queryParams,
    overrides,
  }: ListCredentialsParams &
    ListCredentialsQueryParams &
    Overrides): AsyncListResponse<NylasListResponse<Credential>> {
    return super._list<NylasListResponse<Credential>>({
      queryParams,
      overrides,
      path: `/v3/credentials/${provider}/creds`,
    });
  }

  /**
   * Return a credential
   * @return The credential
   */
  public find({
    provider,
    credentialsId,
    overrides,
  }: FindCredentialParams & Overrides): Promise<NylasResponse<Credential>> {
    return super._find({
      path: `/v3/credentials/${provider}/creds/${credentialsId}`,
      overrides,
    });
  }

  /**
   * Create a credential
   * @return The created credential
   */
  public create({
    provider,
    requestBody,
    overrides,
  }: CreateCredentialParams & Overrides): Promise<NylasResponse<Credential>> {
    return super._create({
      path: `/v3/credentials/${provider}/creds`,
      requestBody,
      overrides,
    });
  }

  /**
   * Update a credential
   * @return The updated credential
   */
  public update({
    provider,
    credentialsId,
    requestBody,
    overrides,
  }: UpdateCredentialParams & Overrides): Promise<NylasResponse<Credential>> {
    return super._update({
      path: `/v3/credentials/${provider}/creds/${credentialsId}}`,
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a credential
   * @return The deleted credential
   */
  public destroy({
    provider,
    credentialsId,
    overrides,
  }: DestroyCredentialParams & Overrides): Promise<NylasDeleteResponse> {
    return super._destroy({
      path: `/v3/credentials/${provider}/creds/${credentialsId}}`,
      overrides,
    });
  }
}
