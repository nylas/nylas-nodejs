import Nylas from '../src/nylas';
import { Routes } from '../src/services/routes';
import { Scope } from '../src/models/connect';
import fetch, { Response } from 'node-fetch';
import AccessToken from '../src/models/access-token';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('Routes', () => {
  const testContext = {};

  beforeEach(() => {
    testContext.nylasClient = new Nylas({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
      apiServer: 'https://api.nylas.com',
    });
    testContext.routes = Routes(testContext.nylasClient);
  });

  describe('buildAuthUrl', () => {
    test('should properly building auth URL', async () => {
      const emailAddress = 'test@example.com';
      const successUrl = '/successPath';
      const clientUri = 'https://clienturi.com';
      const state = 'active';
      const url = await testContext.routes.buildAuthUrl({
        scopes: [Scope.Calendar],
        emailAddress: emailAddress,
        successUrl: successUrl,
        clientUri: clientUri,
        state: state
      });

      expect(url).toEqual(`https://api.nylas.com/oauth/authorize?client_id=myClientId&response_type=code&login_hint=${emailAddress}&redirect_uri=${clientUri}${successUrl}&state=${state}&scopes=${Scope.Calendar}`);

      const urlNoClientUri = await testContext.routes.buildAuthUrl({
        scopes: [Scope.Calendar],
        emailAddress: emailAddress,
        successUrl: successUrl,
        state: state
      });

      expect(urlNoClientUri).toEqual(`https://api.nylas.com/oauth/authorize?client_id=myClientId&response_type=code&login_hint=${emailAddress}&redirect_uri=${successUrl}&state=${state}&scopes=${Scope.Calendar}`);
    });

    test('should properly building auth URL without optional params', async () => {
      const emailAddress = 'test@example.com';
      const successUrl = '/successPath';

      const url = await testContext.routes.buildAuthUrl({
        scopes: [Scope.Calendar],
        emailAddress: emailAddress,
        successUrl: successUrl
      });

      expect(url).toEqual(`https://api.nylas.com/oauth/authorize?client_id=myClientId&response_type=code&login_hint=${emailAddress}&redirect_uri=${successUrl}&scopes=${Scope.Calendar}`);
    });
  });

  describe('exchangeCodeForToken', () => {
    beforeEach(() => {
      testContext.fetch = fetch.mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              access_token: '12345',
              account_id: 'test_account_id',
              email_address: 'test@email.com',
              provider: 'gmail',
              token_type: 'bearer',
            })
          )
        )
      );
    })

    test('should properly exchange code for a token', async () => {
      const accessToken = await testContext.routes.exchangeCodeForToken("code");
      expect(accessToken).toBeInstanceOf(AccessToken);
      expect(accessToken.accessToken).toEqual('12345');
      expect(accessToken.accountId).toEqual('test_account_id');
      expect(accessToken.emailAddress).toEqual('test@email.com');
      expect(accessToken.provider).toEqual('gmail');
      expect(accessToken.tokenType).toEqual('bearer');
    });
  });

  describe('verifyWebhookSignature', () => {
    test('returns true if the signature and buffer match', () => {
      const nylasHeader = "ddc02f921a4835e310f249dc09770c3fea2cb6fe949adc1887d7adc04a581e1c";
      const buff = Buffer.from("test123", 'utf8');
      expect(testContext.routes.verifyWebhookSignature(nylasHeader, buff)).toBe(true);
    });

    test('returns false if the signature and buffer do not match', () => {
      const nylasHeader = "ddc02f921a4835e310f249dc09770c3fea2cb6fe949adc1887d7adc04a581e1c";
      const buff = Buffer.from("test345", 'utf8');
      expect(testContext.routes.verifyWebhookSignature(nylasHeader, buff)).toBe(false);
    })
  })
});