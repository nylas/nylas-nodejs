import { AsyncListResponse, Resource } from './resource.js';
import {
  CreateConfigurationRequest,
  UpdateConfigurationRequest,
  Configuration,
} from '../models/scheduler.js';
import { Overrides } from '../config.js';
import {
  NylasBaseResponse,
  NylasListResponse,
  NylasResponse,
} from '../models/response.js';
import { makePathParams } from '../utils.js';

/**
 * The parameters for the {@link Configurations.find} method
 * @property configurationId The id of the Configuration to retrieve. Use "primary" to refer to the primary configuration associated with grant.
 * @property identifier The identifier of the grant to act upon
 */
export interface FindConfigurationParams {
  identifier: string;
  configurationId: string;
}

/**
 * The parameters for the {@link Configurations.list} method
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
export interface ListConfigurationsParams {
  identifier: string;
}

/**
 * The parameters for the {@link Configurations.create} method
 * @property identifier The identifier of the grant to act upon
 * @property requestBody The request body to create a configuration
 */
export interface CreateConfigurationParams {
  identifier: string;
  requestBody: CreateConfigurationRequest;
}

/**
 * The parameters for the {@link Configurations.update} method
 * @property identifier The identifier of the grant to act upon
 * @property configurationId The id of the Configuration to retrieve. Use "primary" to refer to the primary configuration associated with grant.
 */
export interface UpdateConfigurationParams {
  identifier: string;
  configurationId: string;
  requestBody: UpdateConfigurationRequest;
}

/**
 * The parameters for the {@link Configurations.destroy} method
 * @property identifier The identifier of the grant to act upon
 * @property configurationId The id of the Configuration to retrieve. Use "primary" to refer to the primary configuration associated with grant.
 */
export interface DestroyConfigurationParams {
  identifier: string;
  configurationId: string;
}

export class Configurations extends Resource {
  /**
   * Return all Configurations
   * @return A list of configurations
   */
  public list({
    identifier,
    overrides,
  }: ListConfigurationsParams & Overrides): AsyncListResponse<
    NylasListResponse<Configuration>
  > {
    return super._list<NylasListResponse<Configuration>>({
      overrides,
      path: makePathParams(
        '/v3/grants/{identifier}/scheduling/configurations',
        {
          identifier,
        }
      ),
    });
  }

  /**
   * Return a Configuration
   * @return The configuration
   */
  public find({
    identifier,
    configurationId,
    overrides,
  }: FindConfigurationParams & Overrides): Promise<
    NylasResponse<Configuration>
  > {
    return super._find({
      path: makePathParams(
        '/v3/grants/{identifier}/scheduling/configurations/{configurationId}',
        {
          identifier,
          configurationId,
        }
      ),
      overrides,
    });
  }

  /**
   * Create a Configuration
   * @return The created configuration
   */
  public create({
    identifier,
    requestBody,
    overrides,
  }: CreateConfigurationParams & Overrides): Promise<
    NylasResponse<Configuration>
  > {
    return super._create({
      path: makePathParams(
        '/v3/grants/{identifier}/scheduling/configurations',
        {
          identifier,
        }
      ),
      requestBody,
      overrides,
    });
  }

  /**
   * Update a Configuration
   * @return The updated Configuration
   */
  public update({
    configurationId,
    identifier,
    requestBody,
    overrides,
  }: UpdateConfigurationParams & Overrides): Promise<
    NylasResponse<Configuration>
  > {
    return super._update({
      path: makePathParams(
        '/v3/grants/{identifier}/scheduling/configurations/{configurationId}',
        {
          identifier,
          configurationId,
        }
      ),
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a Configuration
   * @return The deleted Configuration
   */
  public destroy({
    identifier,
    configurationId,
    overrides,
  }: DestroyConfigurationParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: makePathParams(
        '/v3/grants/{identifier}/scheduling/configurations/{configurationId}',
        {
          identifier,
          configurationId,
        }
      ),
      overrides,
    });
  }
}
