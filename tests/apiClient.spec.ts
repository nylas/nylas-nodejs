import APIClient, { RequestOptionsParams } from '../src/apiClient.js';
import PACKAGE_JSON from '../package.json';
import { Response } from 'node-fetch';
import {
  NylasApiError,
  NylasAuthError,
  NylasTokenValidationError,
} from '../src/models/error.js';
const fetch = require('node-fetch');
jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const mockedFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
  mockedFetch.Request = Request;
  mockedFetch.Response = Response;
  return mockedFetch;
});

describe('APIClient', () => {
  describe('constructor', () => {
    it('should initialize all the values', () => {
      const client = new APIClient({
        apiKey: 'test',
        apiUri: 'https://test.api.nylas.com',
        timeout: 30,
      });

      expect(client.apiKey).toBe('test');
      expect(client.serverUrl).toBe('https://test.api.nylas.com');
      expect(client.timeout).toBe(30000);
    });
  });

  describe('request functions', () => {
    let client: APIClient;

    beforeAll(() => {
      client = new APIClient({
        apiKey: 'testApiKey',
        apiUri: 'https://api.us.nylas.com',
        timeout: 30,
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
          overrides: { apiUri: 'https://test.api.nylas.com' },
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
          overrides: { apiUri: 'https://override.api.nylas.com' },
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
        expect(newRequest.body?.toString()).toBe('{"id":"abc123"}');
      });
    });

    describe('requestWithResponse', () => {
      it('should return the data if the response is valid', async () => {
        const payload = {
          id: 123,
          name: 'test',
          isValid: true,
        };
        jest
          .spyOn(Response.prototype, 'text')
          .mockImplementation(() => Promise.resolve(JSON.stringify(payload)));

        const requestWithResponse = await client.requestWithResponse(
          new Response()
        );

        expect(requestWithResponse).toEqual(payload);
      });
    });

    describe('request', () => {
      it('should return a response if the response is valid', async () => {
        const payload = {
          id: 123,
          name: 'test',
          isValid: true,
        };
        fetch.mockImplementationOnce(() => new Response('', { status: 200 }));
        jest
          .spyOn(Response.prototype, 'text')
          .mockImplementation(() => Promise.resolve(JSON.stringify(payload)));

        const response = await client.request({
          path: '/test',
          method: 'GET',
        });
        expect(response).toEqual(payload);
      });

      it('should throw an error if the response is undefined', async () => {
        fetch.mockImplementationOnce(() => undefined);

        await expect(
          client.request({
            path: '/test',
            method: 'GET',
          })
        ).rejects.toThrow(new Error('Failed to fetch response'));
      });

      it('should throw a general error if the response is an error but cannot be parsed', async () => {
        const payload = {
          invalid: true,
        };
        fetch.mockImplementationOnce(() => new Response('', { status: 400 }));
        jest
          .spyOn(Response.prototype, 'text')
          .mockImplementation(() => Promise.resolve(JSON.stringify(payload)));

        await expect(
          client.request({
            path: '/test',
            method: 'GET',
          })
        ).rejects.toThrow(
          new Error(
            'Received an error but could not parse response from the server: {"invalid":true}'
          )
        );
      });

      it('should throw a NylasAuthError if the error comes from connect/token or connect/revoke', async () => {
        const payload = {
          requestId: 'abc123',
          error: 'Test error',
          errorCode: 400,
          errorDescription: 'Nylas SDK Test error',
          errorUri: 'https://test.api.nylas.com/docs/errors#test-error',
        };
        fetch.mockImplementation(() => new Response('', { status: 400 }));
        jest
          .spyOn(Response.prototype, 'text')
          .mockImplementation(() => Promise.resolve(JSON.stringify(payload)));

        await expect(
          client.request({
            path: '/connect/token',
            method: 'POST',
          })
        ).rejects.toThrow(new NylasAuthError(payload));

        await expect(
          client.request({
            path: '/connect/revoke',
            method: 'POST',
          })
        ).rejects.toThrow(new NylasAuthError(payload));
      });

      it('should throw a TokenValidationError if the error comes from connect/tokeninfo', async () => {
        const payload = {
          success: false,
          error: {
            httpCode: 400,
            eventCode: 10020,
            message: 'Invalid access token',
            type: 'AuthenticationError',
            requestId: 'abc123',
          },
        };
        fetch.mockImplementation(() => new Response('', { status: 400 }));
        jest
          .spyOn(Response.prototype, 'text')
          .mockImplementation(() => Promise.resolve(JSON.stringify(payload)));

        await expect(
          client.request({
            path: '/connect/tokeninfo',
            method: 'POST',
          })
        ).rejects.toThrow(new NylasTokenValidationError(payload));
      });

      it('should throw a NylasApiError if the error comes from the other non-auth endpoints', async () => {
        const payload = {
          requestId: 'abc123',
          error: {
            type: 'invalid_request_error',
            message: 'Invalid request',
          },
        };
        fetch.mockImplementation(() => new Response('', { status: 400 }));
        jest
          .spyOn(Response.prototype, 'text')
          .mockImplementation(() => Promise.resolve(JSON.stringify(payload)));

        await expect(
          client.request({
            path: '/events',
            method: 'POST',
          })
        ).rejects.toThrow(new NylasApiError(payload));
      });
    });
  });
});
