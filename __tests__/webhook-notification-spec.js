import WebhookNotification, {
  LinkClick,
  LinkClickCount,
  MessageTrackingData,
  WebhookDelta,
  WebhookObjectAttributes,
  WebhookObjectData,
} from '../src/models/webhook-notification';
import { WebhookTriggers } from '../src/models/webhook';

describe('Webhook Notification', () => {
  test('Should deserialize from JSON properly', done => {
    const webhookNotificationJSON = {
      deltas: [
        {
          date: 1602623196,
          object: 'message',
          type: 'message.created',
          object_data: {
            namespace_id: 'aaz875kwuvxik6ku7pwkqp3ah',
            account_id: 'aaz875kwuvxik6ku7pwkqp3ah',
            object: 'message',
            attributes: {
              action: 'save_draft',
              job_status_id: 'abc1234',
              thread_id: '2u152dt4tnq9j61j8seg26ni6',
              received_date: 1602623166,
            },
            id: '93mgpjynqqu5fohl2dvv6ray7',
            metadata: {
              sender_app_id: 64280,
              link_data: [
                {
                  url: 'https://nylas.com/',
                  count: 1,
                },
              ],
              timestamp: 1602623966,
              recents: [
                {
                  ip: '24.243.155.85',
                  link_index: 0,
                  id: 0,
                  user_agent:
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36',
                  timestamp: 1602623980,
                },
              ],
              message_id: '4utnziee7bu2ohak56wfxe39p',
              payload: 'Tracking enabled',
            },
          },
        },
      ],
    };
    const webhookNotification = new WebhookNotification().fromJSON(
      webhookNotificationJSON
    );
    expect(webhookNotification.deltas.length).toBe(1);

    const webhookDelta = webhookNotification.deltas[0];
    expect(webhookDelta instanceof WebhookDelta).toBe(true);
    expect(webhookDelta.date).toEqual(new Date(1602623196 * 1000));
    expect(webhookDelta.object).toEqual('message');
    expect(webhookDelta.type).toEqual(WebhookTriggers.MessageCreated);

    const webhookDeltaObjectData = webhookDelta.objectData;
    expect(webhookDeltaObjectData instanceof WebhookObjectData).toBe(true);
    expect(webhookDeltaObjectData.id).toEqual('93mgpjynqqu5fohl2dvv6ray7');
    expect(webhookDeltaObjectData.accountId).toEqual(
      'aaz875kwuvxik6ku7pwkqp3ah'
    );
    expect(webhookDeltaObjectData.namespaceId).toEqual(
      'aaz875kwuvxik6ku7pwkqp3ah'
    );
    expect(webhookDeltaObjectData.object).toEqual('message');

    const webhookDeltaObjectAttributes =
      webhookDeltaObjectData.objectAttributes;
    expect(
      webhookDeltaObjectAttributes instanceof WebhookObjectAttributes
    ).toBe(true);
    expect(webhookDeltaObjectAttributes.action).toEqual('save_draft');
    expect(webhookDeltaObjectAttributes.jobStatusId).toEqual('abc1234');
    expect(webhookDeltaObjectAttributes.threadId).toEqual(
      '2u152dt4tnq9j61j8seg26ni6'
    );
    expect(webhookDeltaObjectAttributes.receivedDate).toEqual(
      new Date(1602623166 * 1000)
    );

    const webhookMessageTrackingData = webhookDeltaObjectData.metadata;
    expect(webhookMessageTrackingData instanceof MessageTrackingData).toBe(
      true
    );
    expect(webhookMessageTrackingData.messageId).toEqual(
      '4utnziee7bu2ohak56wfxe39p'
    );
    expect(webhookMessageTrackingData.payload).toEqual('Tracking enabled');
    expect(webhookMessageTrackingData.timestamp).toEqual(
      new Date(1602623966 * 1000)
    );
    expect(webhookMessageTrackingData.senderAppId).toBe(64280);
    expect(webhookMessageTrackingData.linkData.length).toBe(1);
    expect(webhookMessageTrackingData.recents.length).toBe(1);

    const linkData = webhookMessageTrackingData.linkData[0];
    expect(linkData instanceof LinkClickCount).toBe(true);
    expect(linkData.url).toEqual('https://nylas.com/');
    expect(linkData.count).toBe(1);

    const recents = webhookMessageTrackingData.recents[0];
    expect(recents instanceof LinkClick).toBe(true);
    expect(recents.id).toBe(0);
    expect(recents.ip).toEqual('24.243.155.85');
    expect(recents.userAgent).toEqual(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36'
    );
    expect(recents.timestamp).toEqual(new Date(1602623980 * 1000));
    expect(recents.linkIndex).toBe(0);
    done();
  });
});
