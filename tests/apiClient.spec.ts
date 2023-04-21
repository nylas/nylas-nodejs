import APIClient, { RequestOptionsParams } from '../src/apiClient';
import PACKAGE_JSON from '../package.json';

describe('APIClient', () => {
  describe('constructor', () => {
    it('should be initialized with the apiKey minimum', () => {
      const client = new APIClient({ apiKey: 'test' });

      expect(client.constructor.name).toBe('APIClient');
    });

    it('should initialize all the values', () => {
      const client = new APIClient({
        apiKey: 'test',
        serverUrl: 'https://test.api.nylas.com',
        clientId: 'testClientId',
        clientSecret: 'testClientSecret',
      });

      expect(client.apiKey).toBe('test');
      expect(client.serverUrl).toBe('https://test.api.nylas.com');
      expect(client.clientId).toBe('testClientId');
      expect(client.clientSecret).toBe('testClientSecret');
    });
  });

  describe('request', () => {
    let client: APIClient;

    beforeAll(() => {
      client = new APIClient({
        apiKey: 'testApiKey',
        serverUrl: 'https://api.us.nylas.com',
      });
    });

    describe('setRequestUrl', () => {
      it('should set all the fields properly', () => {
        const options = client.requestOptions({
          path: '/test',
          method: 'GET',
          headers: { 'X-SDK-Test-Header': 'This is a test' },
          queryParams: { param: 'value' },
          body: { id: 'abc123' },
          overrides: { serverUrl: 'https://test.api.nylas.com' },
        });

        expect(options.method).toBe('GET');
        expect(options.headers).toEqual({
          Accept: 'application/json',
          Authorization: 'Bearer testApiKey',
          'Content-Type': 'application/json',
          'User-Agent': `Nylas Node SDK v${PACKAGE_JSON.version}`,
          'X-SDK-Test-Header': 'This is a test',
        });
        expect(options.url).toEqual(
          new URL('https://test.api.nylas.com/test?param=value')
        );
        expect(options.body).toBe('{"id":"abc123"}');
      });

      it('should use defaults when just the path and method are passed in', () => {
        const options = client.requestOptions({
          path: '/test',
          method: 'POST',
        });

        expect(options.method).toBe('POST');
        expect(options.headers).toEqual({
          Accept: 'application/json',
          Authorization: 'Bearer testApiKey',
          'User-Agent': `Nylas Node SDK v${PACKAGE_JSON.version}`,
        });
        expect(options.url).toEqual(new URL('https://api.us.nylas.com/test'));
        expect(options.body).toBeUndefined();
      });

      it('should set metadata_pair as a query string', () => {
        const options = client.requestOptions({
          path: '/test',
          method: 'GET',
          queryParams: {
            metadataPair: { key: 'value', anotherKey: 'anotherValue' },
          },
        });

        expect(options.url).toEqual(
          new URL(
            'https://api.us.nylas.com/test?metadata_pair=key%3Avalue%2CanotherKey%3AanotherValue'
          )
        );
      });
    });

    describe('newRequest', () => {
      it('should set all the fields properly', () => {
        const options: RequestOptionsParams = {
          path: '/test',
          method: 'POST',
          headers: { 'X-SDK-Test-Header': 'This is a test' },
          queryParams: { param: 'value' },
          body: { id: 'abc123' },
          overrides: { serverUrl: 'https://override.api.nylas.com' },
        };
        const newRequest = client.newRequest(options);

        expect(newRequest.method).toBe('POST');
        expect(newRequest.headers.raw()).toEqual({
          Accept: ['application/json'],
          Authorization: ['Bearer testApiKey'],
          'Content-Type': ['application/json'],
          'User-Agent': [`Nylas Node SDK v${PACKAGE_JSON.version}`],
          'X-SDK-Test-Header': ['This is a test'],
        });
        expect(newRequest.url).toEqual(
          'https://override.api.nylas.com/test?param=value'
        );
        expect(newRequest.body.toString()).toBe('{"id":"abc123"}');
      });
    });
  });
});
