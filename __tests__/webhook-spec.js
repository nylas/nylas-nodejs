import Nylas from '../src/nylas';

describe('Webhook', () => {
  const CLIENT_ID = 'abc';
  const WEBHOOK_ID = '5rilmlwuo4zmpjedz8bcplclk';
  const webhookJSON = {
    id: WEBHOOK_ID,
    application_id: CLIENT_ID,
    callback_url: 'https://wwww.myapp.com/webhook',
    state: 'active',
    triggers: ['message.opened', 'message.link_clicked'],
    version: '2.0',
  };
  beforeEach(() => {
    Nylas.config({
      clientId: CLIENT_ID,
      clientSecret: 'xyz',
    });
  });

  describe('list', () => {
    test('Should do a GET request to get the webhook list', done => {
      expect.assertions(3);
      Nylas.webhooks.connection.request = jest.fn(() =>
        Promise.resolve([webhookJSON])
      );
      return Nylas.webhooks.list({}, (err, webhooks) => {
        expect(webhooks.length).toEqual(1);
        expect(webhooks[0].id).toEqual(WEBHOOK_ID);
        expect(Nylas.webhooks.connection.request).toHaveBeenCalledWith({
          method: 'GET',
          qs: { limit: 100, offset: 0 },
          path: `/a/${CLIENT_ID}/webhooks`,
        });
        done();
      });
    });
  });

  describe('Get an existing webhook', () => {
    test('Should do a GET request to /a/<client_id>/webhooks/<id>', done => {
      expect.assertions(2);
      Nylas.webhooks.connection.request = jest.fn(() =>
        Promise.resolve(webhookJSON)
      );
      return Nylas.webhooks.find(WEBHOOK_ID).then(webhookResp => {
        expect(webhookResp.toJSON()).toEqual(webhookJSON);
        expect(Nylas.webhooks.connection.request).toHaveBeenCalledWith({
          method: 'GET',
          path: `/a/${CLIENT_ID}/webhooks/${WEBHOOK_ID}`,
          qs: {},
        });
        done();
      });
    });
  });

  describe('Create a new webhook', () => {
    test('Should do a POST request to /a/<client_id>/webhooks', done => {
      expect.assertions(2);
      Nylas.webhooks.connection.request = jest.fn(() =>
        Promise.resolve(webhookJSON)
      );
      const webhook = Nylas.webhooks.build({
        applicationId: CLIENT_ID,
        callbackUrl: 'https://wwww.myapp.com/webhook',
        state: 'active',
        triggers: ['message.opened', 'message.link_clicked'],
        version: '2.0',
      });
      return webhook.save().then(webhookResp => {
        expect(webhookResp.toJSON()).toEqual(webhookJSON);
        expect(Nylas.webhooks.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          path: `/a/${CLIENT_ID}/webhooks`,
          qs: {},
          body: {
            callback_url: 'https://wwww.myapp.com/webhook',
            state: 'active',
            triggers: ['message.opened', 'message.link_clicked'],
          },
        });
        done();
      });
    });
  });

  describe('Update an existing webhook', () => {
    test('Should do a PUT request to /a/<client_id>/webhooks/<id>', done => {
      expect.assertions(2);
      Nylas.webhooks.connection.request = jest.fn(() =>
        Promise.resolve(webhookJSON)
      );
      const webhook = Nylas.webhooks.build({
        id: WEBHOOK_ID,
        applicationId: CLIENT_ID,
        callbackUrl: 'https://wwww.myapp.com/webhook',
        state: 'active',
        triggers: ['message.opened', 'message.link_clicked'],
        version: '2.0',
      });
      return webhook.save().then(webhookResp => {
        expect(webhookResp.toJSON()).toEqual(webhookJSON);
        expect(Nylas.webhooks.connection.request).toHaveBeenCalledWith({
          method: 'PUT',
          path: `/a/${CLIENT_ID}/webhooks/${WEBHOOK_ID}`,
          qs: {},
          body: { state: 'active' },
        });
        done();
      });
    });
  });

  describe('Delete an existing webhook', () => {
    test('Should do a DELETE request to /a/<client_id>/webhooks/<id>', done => {
      expect.assertions(1);
      Nylas.webhooks.connection.request = jest.fn(() => Promise.resolve(null));
      const webhook = Nylas.webhooks.build({
        id: WEBHOOK_ID,
        applicationId: CLIENT_ID,
        callbackUrl: 'https://wwww.myapp.com/webhook',
        state: 'active',
        triggers: ['message.opened', 'message.link_clicked'],
        version: '2.0',
      });
      return Nylas.webhooks.delete(webhook).then(() => {
        expect(Nylas.webhooks.connection.request).toHaveBeenCalledWith({
          method: 'DELETE',
          path: `/a/${CLIENT_ID}/webhooks/${WEBHOOK_ID}`,
          qs: {},
          body: {},
        });
        done();
      });
    });

    test('Should DELETE webhook by ID', done => {
      expect.assertions(1);
      Nylas.webhooks.connection.request = jest.fn(() => Promise.resolve(null));
      return Nylas.webhooks.delete(WEBHOOK_ID).then(() => {
        expect(Nylas.webhooks.connection.request).toHaveBeenCalledWith({
          method: 'DELETE',
          path: `/a/${CLIENT_ID}/webhooks/${WEBHOOK_ID}`,
          qs: {},
          body: {},
        });
        done();
      });
    });
  });
});
