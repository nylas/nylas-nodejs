import { AsyncListResponse, Resource } from './resource';
import { Overrides } from '../config';
import { NylasResponse, NylasListResponse } from '../models/response';
import {
  CreateWebhookRequest,
  UpdateWebhookRequestBody,
  Webhook,
  WebhookDeleteResponse,
  WebhookIpAddressesResponse,
  WebhookWithSecret,
} from '../models/webhooks';

interface CreateWebhookParams {
  requestBody: CreateWebhookRequest;
}

interface UpdateWebhookParams {
  webhookId: string;
  requestBody: UpdateWebhookRequestBody;
}

interface DestroyWebhookParams {
  webhookId: string;
}

export class Webhooks extends Resource {
  /**
   * List all webhook destinations for the application
   * @param overrides Overrides for the request
   * @returns The list of webhook destinations
   */
  public list({ overrides }: Overrides = {}): AsyncListResponse<
    NylasListResponse<Webhook>
  > {
    return super._list<NylasListResponse<Webhook>>({
      overrides,
      path: `/v3/webhooks`,
    });
  }

  /**
   * Create a webhook destination
   * @param requestBody The webhook destination details
   * @param overrides Overrides for the request
   * @returns The created webhook destination
   */
  public create({
    requestBody,
    overrides,
  }: CreateWebhookParams & Overrides): Promise<
    NylasResponse<WebhookWithSecret>
  > {
    return super._create({
      path: `/v3/webhooks`,
      requestBody,
      overrides,
    });
  }

  /**
   * Update a webhook destination
   * @param webhookId The ID of the webhook destination to update
   * @param requestBody The updated webview destination details
   * @param overrides Overrides for the request
   * @returns The updated webhook destination
   */
  public update({
    webhookId,
    requestBody,
    overrides,
  }: UpdateWebhookParams & Overrides): Promise<NylasResponse<Webhook>> {
    return super._update({
      path: `/v3/webhooks/${webhookId}`,
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a webhook destination
   * @param webhookId The ID of the webhook destination to delete
   * @param overrides Overrides for the request
   */
  public destroy({
    webhookId,
    overrides,
  }: DestroyWebhookParams & Overrides): Promise<WebhookDeleteResponse> {
    return super._destroy({
      path: `/v3/webhooks/${webhookId}`,
      overrides,
    });
  }

  /**
   * Update the webhook secret value for a destination
   * @param webhookId The ID of the webhook destination to update
   * @param overrides Overrides for the request
   * @returns The updated webhook destination
   */
  public rotateSecret({
    webhookId,
    overrides,
  }: DestroyWebhookParams & Overrides): Promise<NylasResponse<Webhook>> {
    return super._update({
      path: `/v3/webhooks/${webhookId}/rotate-secret`,
      requestBody: {},
      overrides,
    });
  }

  /**
   * Get the current list of IP addresses that Nylas sends webhooks from
   * @param overrides Overrides for the request
   * @returns The list of IP addresses that Nylas sends webhooks from
   */
  public ipAddresses({ overrides }: Overrides = {}): Promise<
    NylasResponse<WebhookIpAddressesResponse>
  > {
    return super._find({
      path: `/v3/webhooks/ip-addresses`,
      overrides,
    });
  }

  /**
   * Extract the challenge parameter from a URL
   * @param url The URL sent by Nylas containing the challenge parameter
   * @returns The challenge parameter
   */
  public extractChallengeParameter(url: string): string {
    const urlObject = new URL(url);
    const challengeParameter = urlObject.searchParams.get('challenge');
    if (!challengeParameter) {
      throw new Error('Invalid URL or no challenge parameter found.');
    }
    return challengeParameter;
  }
}
