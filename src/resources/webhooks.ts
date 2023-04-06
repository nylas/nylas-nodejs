import { AsyncListResponse, BaseResource } from './baseResource';
import { Overrides } from '../config';
import { ItemResponse, ListResponse } from '../schema/response';
import {
  CreateWebhookRequestBody,
  Webhook,
  WebhookIpAddresses,
  WebhookIpAddressesResponseSchema,
  WebhookListResponseSchema,
  WebhookResponseSchema,
} from '../schema/webhooks';

interface CreateWebhookParams {
  requestBody: CreateWebhookRequestBody;
}

interface UpdateWebhookParams {
  webhookId: string;
  requestBody: CreateWebhookRequestBody;
}

interface DestroyWebhookParams {
  webhookId: string;
}

export class Webhooks extends BaseResource {
  public list({ overrides }: Overrides = {}): AsyncListResponse<
    ListResponse<Webhook>
  > {
    return super._list<ListResponse<Webhook>>({
      overrides,
      path: `/v3/webhooks`,
      responseSchema: WebhookListResponseSchema,
    });
  }

  public create({
    requestBody,
    overrides,
  }: CreateWebhookParams & Overrides): Promise<ItemResponse<Webhook>> {
    return super._create({
      path: `/v3/webhooks`,
      requestBody,
      overrides,
      responseSchema: WebhookResponseSchema,
    });
  }

  public update({
    webhookId,
    requestBody,
    overrides,
  }: UpdateWebhookParams & Overrides): Promise<ItemResponse<Webhook>> {
    return super._update({
      path: `/v3/webhooks/${webhookId}`,
      requestBody,
      overrides,
      responseSchema: WebhookResponseSchema,
    });
  }

  public destroy({
    webhookId,
    overrides,
  }: DestroyWebhookParams & Overrides): Promise<void> {
    return super._destroy({
      path: `/v3/webhooks/${webhookId}`,
      overrides,
    });
  }

  public rotateSecret({
    webhookId,
    overrides,
  }: DestroyWebhookParams & Overrides): Promise<ItemResponse<Webhook>> {
    return super._update({
      path: `/v3/webhooks/${webhookId}/rotate_secret`,
      requestBody: {},
      overrides,
      responseSchema: WebhookResponseSchema,
    });
  }

  public ipAddresses({ overrides }: Overrides = {}): Promise<
    ItemResponse<WebhookIpAddresses>
  > {
    return super._find({
      path: `/v3/webhooks/ip_addresses`,
      overrides,
      responseSchema: WebhookIpAddressesResponseSchema,
    });
  }
}
