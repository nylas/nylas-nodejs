import APIClient from '../apiClient';
import { BaseResource } from './baseResource';
import { Grants } from './grants';

export class Auth extends BaseResource {
  public grants: Grants;

  apiClient: APIClient;

  constructor(apiClient: APIClient) {
    super(apiClient);
    this.apiClient = apiClient;
    this.grants = new Grants(apiClient);
  }

  /**
   * Exchange an authorization code for an access token
   * @param code Application details to overwrite
   * @param callback Application details to overwrite
   * @return Information about the Nylas application
   */
  public exchangeCodeForToken() {
    // TODO: implement
    throw new Error('Not implemented');
  }

  /**
   * Build the URL for authenticating users to your application via Hosted Authentication
   * @param options Configuration for the authentication process
   * @return The URL for hosted authentication
   */
  public urlForAuthentication() {
    // TODO: implement
    throw new Error('Not implemented');
  }

  /**
   * Revoke a single access token
   * @param accessToken The access token to revoke
   */
  public revoke() {
    // TODO: implement
    throw new Error('Not implemented');
  }
}
