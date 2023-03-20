import APIClient from '../apiClient';

export abstract class BaseResource {
  protected apiClient: APIClient;

  constructor(apiClient: APIClient) {
    this.apiClient = apiClient;
  }
}
