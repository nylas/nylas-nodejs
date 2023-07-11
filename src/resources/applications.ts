import { Resource } from './resource';
import { RedirectUris } from './redirectUris';
import APIClient from '../apiClient';
import { ApplicationDetails } from '../models/applicationDetails';
import { NylasResponse } from '../models/response';
import { Overrides } from '../config';

export class Applications extends Resource {
  public redirectUris: RedirectUris;

  constructor(apiClient: APIClient) {
    super(apiClient);
    this.redirectUris = new RedirectUris(apiClient);
  }

  public getDetails({ overrides }: Overrides = {}): Promise<
    NylasResponse<ApplicationDetails>
  > {
    return super._find({
      path: `/v3/applications`,
      overrides,
    });
  }
}
