import { client as WebSocketClient } from 'websocket';
import { v4 as uuidv4 } from 'uuid';
import {
  DEFAULT_REGION,
  DEFAULT_WEBHOOK_TRIGGERS,
  Region,
  regionConfig,
} from '../config';
import Nylas from '../nylas';
import Webhook, { WebhookTriggers } from '../models/webhook';
import { WebhookDelta } from '../models/webhook-notification';

/**
 * Create a webhook to the Nylas forwarding service which will pass messages to our websocket
 * @param callbackDomain The domain name of the callback
 * @param tunnelPath The path to the tunnel
 * @param triggers The list of triggers to subscribe to
 * @return The webhook details response from the API
 */
const buildTunnelWebhook = (
  callbackDomain: string,
  tunnelPath: string,
  triggers: WebhookTriggers[]
): Promise<Webhook> => {
  const callbackUrl = `https://${callbackDomain}/${tunnelPath}`;
  return Nylas.webhooks
    .build({
      callbackUrl,
      state: 'active',
      test: true,
      triggers,
    })
    .save();
};

export interface OpenWebhookTunnelOptions {
  onMessage: (msg: WebhookDelta) => void;
  onConnectFail?: (error: Error) => void;
  onError?: (error: Error) => void;
  onClose?: (wsClient: WebSocketClient) => void;
  onConnect?: (wsClient: WebSocketClient) => void;
  region?: Region;
  triggers?: WebhookTriggers[];
}

/**
 * Open a webhook tunnel and register it with the Nylas API
 * 1. Creates a UUID
 * 2. Opens a websocket connection to Nylas' webhook forwarding service,
 *    with the UUID as a header
 * 3. Creates a new webhook pointed at the forwarding service with the UUID as the path
 *
 * When an event is received by the forwarding service, it will push directly to this websocket
 * connection
 *
 * @param nylasClient The configured Nylas application
 * @param config Configuration for the webhook tunnel, including callback functions, region, and events to subscribe to
 * @return The webhook details response from the API
 */
export const openWebhookTunnel = (
  nylasClient: Nylas,
  config: OpenWebhookTunnelOptions
): Promise<Webhook> => {
  const triggers = config.triggers || DEFAULT_WEBHOOK_TRIGGERS;
  const region = config.region || DEFAULT_REGION;
  const { websocketDomain, callbackDomain } = regionConfig[region];

  // This UUID will map our websocket to a webhook in the forwarding server
  const tunnelId = uuidv4();

  const client = new WebSocketClient({ closeTimeout: 60000 });

  client.on('connectFailed', function(error) {
    config.onConnectFail && config.onConnectFail(error);
  });

  client.on('connect', function(connection) {
    config.onConnect && config.onConnect(client);

    connection.on('error', function(error) {
      config.onError && config.onError(error);
    });

    connection.on('close', function() {
      config.onClose && config.onClose(client);
    });

    connection.on('message', function(message) {
      // This shouldn't happen. If any of these are seen, open an issue
      if (message.type === 'binary') {
        config.onError &&
          config.onError(new Error('Unknown binary message received'));
        return;
      }

      try {
        const req = JSON.parse(message.utf8Data);
        const deltas = JSON.parse(req.body).deltas as Record<string, unknown>[];
        deltas.forEach(delta =>
          config.onMessage(new WebhookDelta().fromJSON(delta))
        );
      } catch (e) {
        config.onError &&
          config.onError(
            new Error(
              `Error converting Nylas websocket event to JSON: ${e &&
                (e as Error).message}`
            )
          );
      }
    });
  });

  client.connect(`wss://${websocketDomain}`, undefined, undefined, {
    'Client-Id': Nylas.clientId,
    'Client-Secret': Nylas.clientSecret,
    'Tunnel-Id': tunnelId,
    Region: region,
  });

  return buildTunnelWebhook(callbackDomain, tunnelId, triggers);
};
