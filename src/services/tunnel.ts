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
 * Deletes the Nylas webhook
 * @param nylasClient The Nylas application configured with the webhook
 * @param nylasWebhook The Nylas webhook details
 */
const deleteTunnelWebhook = (
  nylasClient: Nylas,
  nylasWebhook: Webhook
): void => {
  if (nylasWebhook && nylasWebhook.id) {
    /* eslint-disable no-console */
    console.log(
      `Shutting down the webhook tunnel and deleting id: ${nylasWebhook.id}`
    );
    /* eslint-enable no-console */
    nylasClient.webhooks
      .delete(nylasWebhook)
      .then(() => process.exit())
      .catch((err: Error) => {
        console.warn(
          `Error while trying to deregister the webhook ${nylasWebhook.id}: ${err.message}`
        );
        process.exit();
      });
  }
};

/**
 * Create a webhook to the Nylas forwarding service which will pass messages to our websocket
 * @param nylasClient The configured Nylas application
 * @param callbackDomain The domain name of the callback
 * @param tunnelPath The path to the tunnel
 * @param triggers The list of triggers to subscribe to
 * @return The webhook details response from the API
 */
const buildTunnelWebhook = (
  nylasClient: Nylas,
  callbackDomain: string,
  tunnelPath: string,
  triggers: WebhookTriggers[]
): Promise<Webhook> => {
  const callbackUrl = `https://${callbackDomain}/${tunnelPath}`;
  return nylasClient.webhooks
    .build({
      callbackUrl,
      state: 'active',
      test: true,
      triggers,
    })
    .save()
    .then((webhook: Webhook) => {
      // Ensure that, upon all exits, delete the webhook on the Nylas application
      process.on('SIGINT', () => deleteTunnelWebhook(nylasClient, webhook));
      process.on('SIGTERM', () => deleteTunnelWebhook(nylasClient, webhook));
      process.on('SIGBREAK', () => deleteTunnelWebhook(nylasClient, webhook));
      return webhook;
    });
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
    'Client-Id': nylasClient.clientId,
    'Client-Secret': nylasClient.clientSecret,
    'Tunnel-Id': tunnelId,
    Region: region,
  });

  return buildTunnelWebhook(nylasClient, callbackDomain, tunnelId, triggers);
};
