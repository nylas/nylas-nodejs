import { AsyncListResponse, Resource } from './resource.js';
import {
  Connector,
  CreateConnectorRequest,
  ListConnectorsQueryParams,
  UpdateConnectorRequest,
} from '../models/connectors.js';
import { Overrides } from '../config.js';
import {
  NylasDeleteResponse,
  NylasListResponse,
  NylasResponse,
} from '../models/response.js';
import { Provider } from '../models/auth.js';

/**
 * The parameters for the {@link Connectors.find} method
 * @property provider The provider associated to the connector to retrieve.
 */
interface FindConnectorParams {
  provider: Provider;
}

/**
 * The parameters for the {@link Connectors.list} method
 * @property queryParams The query parameters to include in the request
 */
interface ListConnectorsParams {
  queryParams?: ListConnectorsQueryParams;
}

/**
 * The parameters for the {@link Connectors.create} method
 * @property requestBody The request body to create a connector
 */
interface CreateConnectorParams {
  requestBody: CreateConnectorRequest;
}

/**
 * The parameters for the {@link Connectors.update} method
 * @property provider The provider associated to the connector to update.
 * @property requestBody The request body to create a connector
 */
interface UpdateConnectorParams {
  provider: Provider;
  requestBody: UpdateConnectorRequest;
}

/**
 * The parameters for the {@link Connectors.destroy} method
 * @property provider The provider associated to the connector to update.
 */
interface DestroyConnectorParams {
  provider: string;
}

export class Connectors extends Resource {
  /**
   * Return all connectors
   * @return A list of connectors
   */
  public list({
    queryParams,
    overrides,
  }: ListConnectorsParams &
    ListConnectorsQueryParams &
    Overrides): AsyncListResponse<NylasListResponse<Connector>> {
    return super._list<NylasListResponse<Connector>>({
      queryParams,
      overrides,
      path: `/v3/connectors`,
    });
  }

  /**
   * Return a connector
   * @return The connector
   */
  public find({
    provider,
    overrides,
  }: FindConnectorParams & Overrides): Promise<NylasResponse<Connector>> {
    return super._find({
      path: `/v3/connectors/${provider}`,
      overrides,
    });
  }

  /**
   * Create a connector
   * @return The created connector
   */
  public create({
    requestBody,
    overrides,
  }: CreateConnectorParams & Overrides): Promise<NylasResponse<Connector>> {
    return super._create({
      path: `/v3/connectors`,
      requestBody,
      overrides,
    });
  }

  /**
   * Update a connector
   * @return The updated connector
   */
  public update({
    provider,
    requestBody,
    overrides,
  }: UpdateConnectorParams & Overrides): Promise<NylasResponse<Connector>> {
    return super._update({
      path: `/v3/connectors/${provider}`,
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a connector
   * @return The deleted connector
   */
  public destroy({
    provider,
    overrides,
  }: DestroyConnectorParams & Overrides): Promise<NylasDeleteResponse> {
    return super._destroy({
      path: `/v3/connectors/${provider}`,
      overrides,
    });
  }
}
