import fetch from 'node-fetch';
import Nylas from '../src/nylas';
import ExpressBinding from '../src/server-bindings/express-binding';
import Webhook, { WebhookTriggers } from '../src/models/webhook';
import { WebhookDelta } from '../src/models/webhook-notification';
import { Region } from '../src/config';
import * as Tunnel from '../src/services/tunnel';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

const exchangeMailboxTokenCallback = async (accessTokenObj, res) => {
  const accessToken = accessTokenObj.accessToken;
  const emailAddress = accessTokenObj.emailAddress;

  res.json({
    accessToken: accessToken,
    emailAddress: emailAddress
  });
};

describe('Express Binding', () => {
  const testContext = {};

  beforeEach(() => {
    testContext.nylasClient = new Nylas({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
      apiServer: 'https://api.nylas.com',
    });
    const response = receivedBody => {
      return {
        status: 200,
        text: () => {
          return Promise.resolve(JSON.stringify(receivedBody));
        },
        headers: new Map(),
      };
    };

    fetch.mockImplementation(req => Promise.resolve(response(req.body)));

    testContext.expressBinding = new ExpressBinding(testContext.nylasClient, {
      defaultScopes: [],
      exchangeMailboxTokenCallback,
    });
  });

  describe('Middleware', () => {
    test("Middleware has all the correct routes", async () => {
      const middleware = testContext.expressBinding.buildMiddleware();
      const routes = middleware.stack
        .filter(stack => stack.route)
        .map(stack => stack.route);
      expect(routes.length).toEqual(3);
      const buildAuthRoute = routes.find(route => route.path === "/nylas/generate-auth-url");
      const exchangeCodeRoute = routes.find(route => route.path === "/nylas/exchange-mailbox-token");
      const webhookRoute = routes.find(route => route.path === "/nylas/webhook");
      expect(buildAuthRoute).not.toBeUndefined();
      expect(buildAuthRoute.methods).toEqual({post: true});
      expect(exchangeCodeRoute).not.toBeUndefined();
      expect(exchangeCodeRoute.methods).toEqual({post: true});
      expect(webhookRoute).not.toBeUndefined();
      expect(webhookRoute.methods).toEqual({post: true});
    });

    test("Middleware has all the correct routes after overriding", async () => {
      const expressBinding = new ExpressBinding(testContext.nylasClient, {
        defaultScopes: [],
        exchangeMailboxTokenCallback,
        overridePaths: {
          buildAuthUrl: '/test/url1',
          exchangeCodeForToken: '/test/url2',
          webhooks: '/test/url3'
        }
      });
      const middleware = expressBinding.buildMiddleware();
      const routes = middleware.stack
        .filter(stack => stack.route)
        .map(stack => stack.route);
      expect(routes.length).toEqual(3);
      const buildAuthRoute = routes.find(route => route.path === "/test/url1");
      const exchangeCodeRoute = routes.find(route => route.path === "/test/url2");
      const webhookRoute = routes.find(route => route.path === "/test/url3");
      expect(buildAuthRoute).not.toBeUndefined();
      expect(exchangeCodeRoute).not.toBeUndefined();
      expect(webhookRoute).not.toBeUndefined();
    });

    test("Webhook verification middleware should pass if the body matches the Nylas signature", () => {
      const req = {
        header: jest.fn((header) => {
          if(header === 'x-nylas-signature') {
            return 'ddc02f921a4835e310f249dc09770c3fea2cb6fe949adc1887d7adc04a581e1c';
          }
        }),
        body: Buffer.from('test123', 'utf8')
      };
      const res = {
        send: jest.fn(),
        status: jest.fn()
      }
      const next = jest.fn();

      const middleware = testContext.expressBinding.webhookVerificationMiddleware();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("Webhook verification middleware should redirect to 401 if the body does not match the Nylas signature", () => {
      const req = {
        header: jest.fn((header) => {
          if(header === 'x-nylas-signature') {
            return 'ddc02f921a4835e310f249dc09770c3fea2cb6fe949adc1887d7adc04a581e1c';
          }
        }),
        body: Buffer.from('test12345', 'utf8')
      };
      const res = {
        status: jest.fn(() => {
          return {
            send: jest.fn()
          }
        })
      };
      jest.spyOn(res, 'status');
      const next = jest.fn();

      const middleware = testContext.expressBinding.webhookVerificationMiddleware();
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toBeCalledWith(401);
    });
  })

  // Server Bindings is an abstract class so test its functions via ExpressBindings
  describe("Server Bindings specific", () => {
    describe("Webhooks", () => {
      test("Starting dev webhook returns a Nylas webhook instance", async () => {
        const webhook = await testContext.expressBinding.startDevelopmentWebsocket();
        expect(webhook instanceof Webhook).toBe(true);
      });

      test("Overrides set by the user for dev webhook is accepted and passed to the webhook config", async () => {
        jest.mock('websocket');
        const spy = jest.spyOn(Tunnel, 'openWebhookTunnel').mockImplementation();
        const webhookTunnelConfig = {
          onMessage: jest.fn(),
          onClose: jest.fn(),
          onConnectFail: jest.fn(),
          onError: jest.fn(),
          onConnect: jest.fn(),
          region: Region.Canada,
          triggers: [WebhookTriggers.CalendarUpdated]
        }
        await testContext.expressBinding.startDevelopmentWebsocket(webhookTunnelConfig);
        expect(spy).toBeCalledWith(testContext.nylasClient, webhookTunnelConfig);
      });
    });

    describe("Event Emitters", () => {
      test('handleDeltaEvent extracts and emits the webhook trigger properly', done => {
        const delta = new WebhookDelta();
        delta.type = "account.running"

        const emit = jest.spyOn(testContext.expressBinding, 'emit').mockImplementation((trigger) => {
          expect(trigger).toEqual(WebhookTriggers.AccountRunning);
          done();
        });

        testContext.expressBinding.handleDeltaEvent(delta);
        expect(emit).toBeCalledTimes(1);
      });

      test('handleDeltaEvent does not emit if the delta object does not contain a type', () => {
        const delta = new WebhookDelta();

        const emit = jest.spyOn(testContext.expressBinding, 'emit').mockImplementation();

        testContext.expressBinding.handleDeltaEvent(delta);
        expect(emit).not.toBeCalled();
      });

      test('emitDeltaEvents deserializes delta JSONs', done => {
        const deltaJSONs = [{
          date: 1601668428,
          object: "calendar",
          type: "calendar.updated",
          object_data: {
            account_id: "aaz875kwuvxik6ku7pwkqp3ah",
            object: "calendar",
            id: "2x6fbv82cctfjqtzex0aqll96"
          }
        }];

        jest.spyOn(testContext.expressBinding, 'handleDeltaEvent').mockImplementation((delta) => {
          expect(delta instanceof WebhookDelta).toBe(true);
          expect(delta.type).toEqual(WebhookTriggers.CalendarUpdated);
          done();
        });

        testContext.expressBinding.emitDeltaEvents(deltaJSONs);
      });

      test('emitDeltaEvents emits once per delta', () => {
        const deltaJSONs = [
          {
            date: 1601668428,
            object: "calendar",
            type: "calendar.updated",
            object_data: {
              account_id: "aaz875kwuvxik6ku7pwkqp3ah",
              object: "calendar",
              id: "2x6fbv82cctfjqtzex0aqll96"
            }
          },
          {
            date: 1601668428,
            object: "calendar",
            type: "calendar.updated",
            object_data: {
              account_id: "aaz875kwuvxik6ku7pwkqp3ah",
              object: "calendar",
              id: "2x6fbv82cctfjqtzex0aqll96"
            }
          },
          {
            date: 1601668428,
            object: "calendar",
            type: "calendar.updated",
            object_data: {
              account_id: "aaz875kwuvxik6ku7pwkqp3ah",
              object: "calendar",
              id: "2x6fbv82cctfjqtzex0aqll96"
            }
          }
        ];

        const emit = jest.spyOn(testContext.expressBinding, 'emit').mockImplementation();

        testContext.expressBinding.emitDeltaEvents(deltaJSONs);
        expect(emit).toBeCalledTimes(3);
      });
    });
  });
});
