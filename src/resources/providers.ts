import { Resource } from './resource';
import { NylasListResponse, NylasResponse } from '../models/response';
import {
  Provider,
  ProviderDetectParams,
  ProviderDetectResponse,
} from '../models/providers';
import APIClient from '../apiClient';

export class Providers extends Resource {
  clientId: string;
  clientSecret: string;

  constructor(apiClient: APIClient, clientId: string, clientSecret: string) {
    super(apiClient);
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private checkAuthCredentials(): void {
    if (!this.clientId) {
      throw new Error('ClientID is required for using providers');
    }
  }

  /**
   * Lists created providers(integrations)
   * @return List of created providers with type & settings if supported
   */
  public async list(): Promise<NylasListResponse<Provider>> {
    this.checkAuthCredentials();
    return await this.apiClient.request<NylasListResponse<Provider>>({
      method: 'GET',
      path: `/v3/connect/providers/find`,
      queryParams: {
        clientId: this.clientId,
      },
    });
  }

  /**
   * Detects provider for passed email (if allProviderTypes set to true tries to detect provider based on all supported providers)
   * @return Information about the passed provider email
   */
  public async detect(
    params: ProviderDetectParams
  ): Promise<NylasResponse<ProviderDetectResponse>> {
    this.checkAuthCredentials();
    return await this.apiClient.request<NylasResponse<ProviderDetectResponse>>({
      method: 'POST',
      path: `/v3/providers/detect`,
      queryParams: {
        clientId: this.clientId,
        ...params,
      },
    });
  }
}
