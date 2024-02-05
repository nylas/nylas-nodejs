import { Resource } from './resource.js';
import { RedirectUris } from './redirectUris.js';
import APIClient from '../apiClient.js';
import { ApplicationDetails } from '../models/applicationDetails.js';
import { NylasResponse } from '../models/response.js';
import { Overrides } from '../config.js';

/**
 * Nylas Applications API
 *
 * This endpoint allows for getting application details as well as redirect URI operations.
 */
export class Applications extends Resource {
  /**
   * Access the collection of redirect URI related API endpoints.
   */
  public redirectUris: RedirectUris;

  /**
   * @param apiClient client The configured Nylas API client
   */
  constructor(apiClient: APIClient) {
    super(apiClient);
    this.redirectUris = new RedirectUris(apiClient);
  }

  /**
   * Get application details
   * @returns The application details
   */
  public getDetails({ overrides }: Overrides = {}): Promise<
    NylasResponse<ApplicationDetails>
  > {
    return super._find({
      path: `/v3/applications`,
      overrides,
    });
  }
}
