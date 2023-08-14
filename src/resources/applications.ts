import { Resource } from './resource';
import { RedirectUris } from './redirectUris';
import APIClient from '../apiClient';
import { ApplicationDetails } from '../models/applicationDetails';
import { NylasResponse } from '../models/response';
import { Overrides } from '../config';

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
