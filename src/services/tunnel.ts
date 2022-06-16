import { client as WebSocketClient } from 'websocket';
import { v4 as uuidv4 } from 'uuid';
import {
  DEFAULT_REGION,
  DEFAULT_WEBHOOK_TRIGGERS,
  Region,
  regionConfig,
} from '../config';
import Nylas from '../nylas';
import { WebhookTriggers } from '../models/webhook';
import {
  WebhookDeltaProperties,
  WebhookNotificationProperties,
} from '../models/webhook-notification';

/**
 * Create a webhook to the Nylas forwarding service which will pass messages to our websocket
 */
const buildTunnelWebhook = (
  nylasClient: Nylas,
  callbackDomain: string,
  tunnelId: string,
  triggers: WebhookTriggers[]
) => {
  const callbackUrl = `https://${callbackDomain}/${tunnelId}`;
  return nylasClient.webhooks
    .build({
      callbackUrl,
      state: 'active',
      test: true,
      triggers,
    })
    .save();
};

/**
 * 1. Creates a UUID
 * 2. Opens a websocket connection to Nylas' webhook forwarding service,
 *    with the UUID as a header
 * 3. Creates a new webhook pointed at the forwarding service with the UUID as the path
 *
 * When an event is received by the forwarding service, it will push directly to this websocket
 * connection
 */
export const openWebhookTunnel = (config: {
  nylasClient: Nylas;
  onMessage: (msg: WebhookDeltaProperties) => void;
  onConnectFail?: (error: Error) => void;
  onError?: (error: Error) => void;
  onClose?: (wsClient: WebSocketClient) => void;
  onConnect?: (wsClient: WebSocketClient) => void;
  region?: Region;
  triggers?: WebhookTriggers[];
}) => {
  const triggers = config.triggers || DEFAULT_WEBHOOK_TRIGGERS;
  const region = config.region || DEFAULT_REGION;
  const { websocketDomain, callbackDomain } = regionConfig[region];

  // This UUID will map our websocket to a webhook in the forwarding server
  const tunnelId = uuidv4();

  var client = new WebSocketClient({ closeTimeout: 60000 });

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
        console.log('Unknown binary message received');
        return;
      }

      try {
        const req = JSON.parse(message.utf8Data) as {
          body?: WebhookNotificationProperties;
        };
        req?.body?.deltas?.forEach?.(delta => config.onMessage(delta));
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
    'Client-Id': config.nylasClient.clientId,
    'Client-Secret': config.nylasClient.clientSecret,
    'Tunnel-Id': tunnelId,
    Region: region,
  });

  return buildTunnelWebhook(
    config.nylasClient,
    callbackDomain,
    tunnelId,
    triggers
  );
};
