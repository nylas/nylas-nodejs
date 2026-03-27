/**
 * Template for creating new Nylas API model types.
 * Copy this file and replace {{ResourceName}} and {{resourceName}} with your resource names.
 *
 * Usage:
 * - {{ResourceName}} = PascalCase (e.g., "Widget", "CustomField")
 * - {{resourceName}} = camelCase (e.g., "widget", "customField")
 */

import { ListQueryParams } from './listQueryParams.js';

/**
 * Interface representing a Nylas {{ResourceName}} object.
 */
export interface {{ResourceName}} {
  /**
   * Globally unique object identifier.
   */
  id: string;

  /**
   * Grant ID of the Nylas account.
   */
  grantId: string;

  /**
   * The type of object.
   */
  object: '{{resourceName}}';

  // Add resource-specific properties below
}

/**
 * Interface representing the query parameters for listing {{ResourceName}}s.
 */
export interface List{{ResourceName}}QueryParams extends ListQueryParams {
  // Add resource-specific query parameters
}

/**
 * Interface representing the query parameters for finding a single {{ResourceName}}.
 */
export interface Find{{ResourceName}}QueryParams {
  // Add resource-specific query parameters (usually empty or minimal)
}

/**
 * Interface for creating a {{ResourceName}}.
 */
export type Create{{ResourceName}}Request = {
  // Add all required and optional properties for creation
};

/**
 * Interface for updating a {{ResourceName}}.
 */
export type Update{{ResourceName}}Request = Partial<Create{{ResourceName}}Request>;
