import { BaseResource } from './baseResource';
import { ListResponse, ItemResponse } from '../schema/response';
import {
  ProviderListResponseSchema,
  ProviderDetectParams,
  ProviderDetectResponseSchema,
  Provider,
  ProviderDetect,
} from '../schema/providers';

export class Providers extends BaseResource {
  private checkCreadentials(): void {
    if (!this.apiClient.clientId) {
      throw new Error('ClientID is required for using providers');
    }
  }

  /**
   * Lists created providers(integrations)
   * @return List of created providers with type & settings if supported
   */
  public async list(): Promise<ListResponse<Provider>> {
    this.checkCreadentials();
    const res = await this.apiClient.request<ListResponse<Provider>>(
      {
        method: 'GET',
        path: `/v3/connect/providers/find`,
        queryParams: {
          clientId: this.apiClient.clientId,
        },
      },
      {
        responseSchema: ProviderListResponseSchema,
      }
    );
    return res;
  }

  /**
   * Detects provider for passed email (if allProviderTypes set to true tries to detect provider based on all supported providers)
   * @param ProviderDetectParams
   * @return Information about the passed provider email
   */
  public async detect(
    params: ProviderDetectParams
  ): Promise<ItemResponse<ProviderDetect>> {
    this.checkCreadentials();
    const res = await this.apiClient.request<ItemResponse<ProviderDetect>>(
      {
        method: 'POST',
        path: `/v3/providers/detect`,
        queryParams: {
          clientId: this.apiClient.clientId,
          ...params,
        },
      },
      {
        responseSchema: ProviderDetectResponseSchema,
      }
    );
    return res;
  }
}
