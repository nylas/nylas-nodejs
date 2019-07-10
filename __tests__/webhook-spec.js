import Nylas from '../src/nylas';

describe('Webhook', () => {
  const APP_ID = 'abc';
  const WEBHOOK_ID = '5rilmlwuo4zmpjedz8bcplclk';
  const webhookJSON = {
    id: WEBHOOK_ID,
    application_id: APP_ID,
    callback_url: 'https://wwww.myapp.com/webhook',
    state: 'active',
    triggers: ['message.opened', 'message.link_clicked'],
    version: '2.0'
  };
  beforeEach(() => {
    Nylas.config({
      appId: APP_ID,
      appSecret: 'xyz',
    });
  });

  describe('list', () => {
    test('Should do a GET request to get the webhook list', done => {
      expect.assertions(3);
      Nylas.webhooks.connection.request = jest.fn(() =>
        Promise.resolve([webhookJSON])
      );
      Nylas.webhooks
        .list({}, (err, webhooks) => {
          expect(webhooks.length).toEqual(1);
          expect(webhooks[0].id).toEqual(WEBHOOK_ID);
          expect(Nylas.webhooks.connection.request).toHaveBeenCalledWith({
            method: 'GET',
            qs: { limit: 100, offset: 0 },
            path: `/a/${APP_ID}/webhooks`,
          });
          done();
        })
    });
  });

  describe('Get an existing webhook', () => {
    test('Should do a GET request to /a/<app_id>/webhooks/<id>', done => {
      expect.assertions(2);
      Nylas.webhooks.connection.request = jest.fn(() =>
        Promise.resolve(webhookJSON)
      );
      Nylas.webhooks.find(WEBHOOK_ID).then(webhookResp => {
        expect(webhookResp.toJSON()).toEqual(webhookJSON);
        expect(Nylas.webhooks.connection.request).toHaveBeenCalledWith({
          method: 'GET',
          path: `/a/${APP_ID}/webhooks/${WEBHOOK_ID}`,
          qs: {}
        });
        done();
        })
    });
  });

  describe('Create a new webhook', () => {
    test('Should do a POST request to /a/<app_id>/webhooks', done => {
      expect.assertions(2);
      Nylas.webhooks.connection.request = jest.fn(() =>
        Promise.resolve(webhookJSON)
      );
      const webhook = Nylas.webhooks.build({
        applicationId: APP_ID,
        callbackUrl: 'https://wwww.myapp.com/webhook',
        state: 'active',
        triggers: ['message.opened', 'message.link_clicked'],
        version: '2.0'
      });
      webhook.save().then(webhookResp => {
        expect(webhookResp.toJSON()).toEqual(webhookJSON);
        expect(Nylas.webhooks.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          path: `/a/${APP_ID}/webhooks`,
          qs: {},
          body: {
            callback_url: 'https://wwww.myapp.com/webhook',
            state: 'active',
            triggers: ['message.opened', 'message.link_clicked'],
          },
        });
        done();
        })
    });
  });

  describe('Update an existing webhook', () => {
    test('Should do a PUT request to /a/<app_id>/webhooks/<id>', done => {
      expect.assertions(2);
      Nylas.webhooks.connection.request = jest.fn(() =>
        Promise.resolve(webhookJSON)
      );
      const webhook = Nylas.webhooks.build({
        id: WEBHOOK_ID,
        applicationId: APP_ID,
        callbackUrl: 'https://wwww.myapp.com/webhook',
        state: 'active',
        triggers: ['message.opened', 'message.link_clicked'],
        version: '2.0'
      });
      webhook.save().then(webhookResp => {
        expect(webhookResp.toJSON()).toEqual(webhookJSON);
        expect(Nylas.webhooks.connection.request).toHaveBeenCalledWith({
          method: 'PUT',
          path: `/a/${APP_ID}/webhooks/${WEBHOOK_ID}`,
          qs: {},
          body: {state: 'active'},
        });
        done();
        })
    });
  });

  describe('Delete an existing webhook', () => {
    test('Should do a DELETE request to /a/<app_id>/webhooks/<id>', done => {
      expect.assertions(1);
      Nylas.webhooks.connection.request = jest.fn(() =>
        Promise.resolve(null)
      );
      const webhook = Nylas.webhooks.build({
        id: WEBHOOK_ID,
        applicationId: APP_ID,
        callbackUrl: 'https://wwww.myapp.com/webhook',
        state: 'active',
        triggers: ['message.opened', 'message.link_clicked'],
        version: '2.0'
      });
      Nylas.webhooks.delete(webhook).then(webhookResp => {
        expect(Nylas.webhooks.connection.request).toHaveBeenCalledWith({
          method: 'DELETE',
          path: `/a/${APP_ID}/webhooks/${WEBHOOK_ID}`,
          qs: {},
          body: {},
        });
        done();
        })
    });

    test('Should DELETE webhook by ID', done => {
      expect.assertions(1);
      Nylas.webhooks.connection.request = jest.fn(() =>
        Promise.resolve(null)
      );
      Nylas.webhooks.delete(WEBHOOK_ID).then(webhookResp => {
        expect(Nylas.webhooks.connection.request).toHaveBeenCalledWith({
          method: 'DELETE',
          path: `/a/${APP_ID}/webhooks/${WEBHOOK_ID}`,
          qs: {},
          body: {},
        });
        done();
        })
    });
  });
});