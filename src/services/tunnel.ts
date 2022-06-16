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

export const openWebhookTunnel = <T>(config: {
  nylasClient: Nylas;
  onMessage: (msg: T) => void;
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
      if (message.type === 'binary') {
        console.log('Unknown binary message received');
        return;
      }

      try {
        config.onMessage(JSON.parse(message.utf8Data));
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
