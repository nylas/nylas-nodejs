/**
 * Template for creating new Nylas API resources.
 * Copy this file and replace {{ResourceName}} and {{resourceName}} with your resource names.
 *
 * Usage:
 * - {{ResourceName}} = PascalCase (e.g., "Widgets", "CustomFields")
 * - {{resourceName}} = camelCase (e.g., "widgets", "customFields")
 * - {{resource-name}} = kebab-case for API paths (e.g., "widgets", "custom-fields")
 */

import { Overrides } from '../config.js';
import {
  Create{{ResourceName}}Request,
  {{ResourceName}},
  List{{ResourceName}}QueryParams,
  Find{{ResourceName}}QueryParams,
  Update{{ResourceName}}Request,
} from '../models/{{resourceName}}.js';
import {
  NylasResponse,
  NylasListResponse,
  NylasBaseResponse,
} from '../models/response.js';
import { AsyncListResponse, Resource } from './resource.js';

/**
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
interface List{{ResourceName}}Params {
  identifier: string;
  queryParams?: List{{ResourceName}}QueryParams;
}

/**
 * @property {{resourceName}}Id The id of the {{ResourceName}} to retrieve
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
interface Find{{ResourceName}}Params {
  identifier: string;
  {{resourceName}}Id: string;
  queryParams?: Find{{ResourceName}}QueryParams;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property requestBody The values to create the {{ResourceName}} with
 */
interface Create{{ResourceName}}Params {
  identifier: string;
  requestBody: Create{{ResourceName}}Request;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property {{resourceName}}Id The id of the {{ResourceName}} to update
 * @property requestBody The values to update the {{ResourceName}} with
 */
interface Update{{ResourceName}}Params {
  identifier: string;
  {{resourceName}}Id: string;
  requestBody: Update{{ResourceName}}Request;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property {{resourceName}}Id The id of the {{ResourceName}} to delete
 */
interface Destroy{{ResourceName}}Params {
  identifier: string;
  {{resourceName}}Id: string;
}

/**
 * Nylas {{ResourceName}} API
 *
 * The {{ResourceName}} API allows you to [describe purpose].
 */
export class {{ResourceName}}s extends Resource {
  /**
   * Return all {{ResourceName}}s
   * @return The list of {{ResourceName}}s
   */
  public list({
    identifier,
    queryParams,
    overrides,
  }: List{{ResourceName}}Params & Overrides): AsyncListResponse<
    NylasListResponse<{{ResourceName}}>
  > {
    return super._list({
      queryParams,
      path: `/v3/grants/${identifier}/{{resource-name}}s`,
      overrides,
    });
  }

  /**
   * Return a {{ResourceName}}
   * @return The {{ResourceName}}
   */
  public find({
    identifier,
    {{resourceName}}Id,
    queryParams,
    overrides,
  }: Find{{ResourceName}}Params & Overrides): Promise<NylasResponse<{{ResourceName}}>> {
    return super._find({
      path: `/v3/grants/${identifier}/{{resource-name}}s/${{{resourceName}}Id}`,
      queryParams,
      overrides,
    });
  }

  /**
   * Create a {{ResourceName}}
   * @return The created {{ResourceName}}
   */
  public create({
    identifier,
    requestBody,
    overrides,
  }: Create{{ResourceName}}Params & Overrides): Promise<NylasResponse<{{ResourceName}}>> {
    return super._create({
      path: `/v3/grants/${identifier}/{{resource-name}}s`,
      requestBody,
      overrides,
    });
  }

  /**
   * Update a {{ResourceName}}
   * @return The updated {{ResourceName}}
   */
  public update({
    identifier,
    {{resourceName}}Id,
    requestBody,
    overrides,
  }: Update{{ResourceName}}Params & Overrides): Promise<NylasResponse<{{ResourceName}}>> {
    return super._update({
      path: `/v3/grants/${identifier}/{{resource-name}}s/${{{resourceName}}Id}`,
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a {{ResourceName}}
   * @return The deletion response
   */
  public destroy({
    identifier,
    {{resourceName}}Id,
    overrides,
  }: Destroy{{ResourceName}}Params & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: `/v3/grants/${identifier}/{{resource-name}}s/${{{resourceName}}Id}`,
      overrides,
    });
  }
}
