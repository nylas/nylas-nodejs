import { AsyncListResponse, Resource } from './resource.js';
import { Overrides } from '../config.js';
import { NylasResponse, NylasListResponse } from '../models/response.js';
import {
  CreateWebhookRequest,
  UpdateWebhookRequest,
  Webhook,
  WebhookDeleteResponse,
  WebhookIpAddressesResponse,
  WebhookWithSecret,
} from '../models/webhooks.js';

/**
 * @property webhookId The ID of the webhook destination to update
 */
interface FindWebhookParams {
  webhookId: string;
}

/**
 * @property requestBody The webhook destination details
 */
interface CreateWebhookParams {
  requestBody: CreateWebhookRequest;
}

/**
 * @property webhookId The ID of the webhook destination to update
 * @property requestBody The updated webview destination details
 */
interface UpdateWebhookParams {
  webhookId: string;
  requestBody: UpdateWebhookRequest;
}

/**
 * @property webhookId The ID of the webhook destination to delete
 */
interface DestroyWebhookParams {
  webhookId: string;
}

/**
 * Nylas Webhooks API
 *
 * The Nylas Webhooks API allows your application to receive notifications in real-time when certain events occur.
 */
export class Webhooks extends Resource {
  /**
   * List all webhook destinations for the application
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
   * Return a webhook destination
   * @return The webhook destination
   */
  public find({
    webhookId,
    overrides,
  }: FindWebhookParams & Overrides): Promise<NylasResponse<Webhook>> {
    return super._find({
      path: `/v3/webhooks/${webhookId}`,
      overrides,
    });
  }

  /**
   * Create a webhook destination
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
   * @returns The deletion response
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
   * @returns The updated webhook destination with the webhook secret
   */
  public rotateSecret({
    webhookId,
    overrides,
  }: DestroyWebhookParams & Overrides): Promise<
    NylasResponse<WebhookWithSecret>
  > {
    return super._update({
      path: `/v3/webhooks/${webhookId}/rotate-secret`,
      requestBody: {},
      overrides,
    });
  }

  /**
   * Get the current list of IP addresses that Nylas sends webhooks from
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
