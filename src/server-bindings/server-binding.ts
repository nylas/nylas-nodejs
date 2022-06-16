import crypto from 'crypto';
import { Express, Response } from 'express';
import { Scope } from '../models/connect';
import { EventEmitter } from 'events';
import { WebhookTriggers } from '../models/webhook';
import {
  WebhookDelta,
  WebhookDeltaProperties,
} from '../models/webhook-notification';
import AccessToken from '../models/access-token';
import Nylas from '../nylas';
import {
  openWebhookTunnel,
  OpenWebhookTunnelOptions,
} from '../services/tunnel';

type SupportedFrameworks = Express;

export enum ServerEvents {
  TokenExchange = 'token-exchange',
}

export type ServerBindingOptions = {
  defaultScopes: Scope[];
  routePrefix?: string;
  clientUri?: string;
  useDevelopmentWebsocketEventListener?:
    | boolean
    | Partial<OpenWebhookTunnelOptions>;
};

export abstract class ServerBinding extends EventEmitter
  implements ServerBindingOptions {
  nylasClient: Nylas;
  app: SupportedFrameworks;
  defaultScopes: Scope[];
  routePrefix?: string;
  clientUri?: string;
  useDevelopmentWebsocketEventListener?:
    | boolean
    | Partial<OpenWebhookTunnelOptions>;

  static DEFAULT_ROUTE_PREFIX = '/nylas';
  static NYLAS_SIGNATURE_HEADER = 'x-nylas-signature';
  private _untypedOn = this.on;
  private _untypedEmit = this.emit;

  protected constructor(
    nylasClient: Nylas,
    app: SupportedFrameworks,
    options: ServerBindingOptions
  ) {
    super();
    this.nylasClient = nylasClient;
    this.app = app;
    this.defaultScopes = options.defaultScopes;
    this.routePrefix = options.routePrefix;
    this.clientUri = options.clientUri;
    this.useDevelopmentWebsocketEventListener =
      options.useDevelopmentWebsocketEventListener;
  }

  abstract mount(): void;

  // Taken from the best StackOverflow answer of all time https://stackoverflow.com/a/56228127
  public on = <K extends WebhookTriggers | ServerEvents>(
    event: K,
    listener: (
      payload: K extends WebhookTriggers
        ? WebhookDelta
        : { accessTokenObj: AccessToken; res: Response }
    ) => void
  ): this => this._untypedOn(event, listener);

  public emit = <K extends WebhookTriggers | ServerEvents>(
    event: K,
    payload: K extends WebhookTriggers
      ? WebhookDelta
      : { accessTokenObj: AccessToken; res: Response }
  ): boolean => this._untypedEmit(event, payload);

  verifyWebhookSignature(
    secret: string,
    xNylasSignature: string,
    rawBody: Buffer
  ): boolean {
    const digest = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return digest === xNylasSignature;
  }

  protected startDevelopmentWebsocket(): void {
    if (!this.useDevelopmentWebsocketEventListener) {
      return;
    }

    const webhookConfig: Partial<OpenWebhookTunnelOptions> = {};

    if (typeof this.useDevelopmentWebsocketEventListener === 'object') {
      webhookConfig.onMessage = this.useDevelopmentWebsocketEventListener.onMessage;
      webhookConfig.onClose = this.useDevelopmentWebsocketEventListener.onClose;
      webhookConfig.onConnectFail = this.useDevelopmentWebsocketEventListener.onConnectFail;
      webhookConfig.onError = this.useDevelopmentWebsocketEventListener.onError;
      webhookConfig.onConnect = this.useDevelopmentWebsocketEventListener.onConnect;
      webhookConfig.triggers = this.useDevelopmentWebsocketEventListener.triggers;
      webhookConfig.region = this.useDevelopmentWebsocketEventListener.region;
    }

    /* eslint-disable no-console */
    const defaultOnClose = (): void =>
      console.log('Nylas websocket client connection closed');
    const defaultOnConnectFail = (e: Error): void =>
      console.log('Failed to connect Nylas websocket client', e.message);
    const defaultOnError = (e: Error): void =>
      console.log('Error in Nylas websocket client', e.message);
    const defaultOnConnect = (): void =>
      console.log('Nylas websocket client connected');
    /* eslint-enable no-console */

    openWebhookTunnel(this.nylasClient, {
      onMessage: webhookConfig.onMessage || this.handleDeltaEvent,
      onClose: webhookConfig.onClose || defaultOnClose,
      onConnectFail: webhookConfig.onConnectFail || defaultOnConnectFail,
      onError: webhookConfig.onError || defaultOnError,
      onConnect: webhookConfig.onConnect || defaultOnConnect,
      triggers: webhookConfig.triggers,
      region: webhookConfig.region,
    });
  }

  // Can be used either by websocket or webhook
  protected handleDeltaEvent = (d: WebhookDelta): void => {
    d.type && this.emit(d.type as WebhookTriggers, d);
  };

  protected buildRoute(path: string): string {
    const prefix = this.routePrefix
      ? this.routePrefix
      : ServerBinding.DEFAULT_ROUTE_PREFIX;
    return prefix + path;
  }
}
