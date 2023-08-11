import { Resource } from './resource';
import { RedirectUris } from './redirectUris';
import APIClient from '../apiClient';
import { ApplicationDetails } from '../models/applicationDetails';
import { NylasResponse } from '../models/response';
import { Overrides } from '../config';

export class Applications extends Resource {
  /**
   * Access the collection of redirect URI related API endpoints.
   */
  public redirectUris: RedirectUris;

  constructor(apiClient: APIClient) {
    super(apiClient);
    this.redirectUris = new RedirectUris(apiClient);
  }

  /**
   * Get application details
   * @param overrides Get Availability for a given account / accounts
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
