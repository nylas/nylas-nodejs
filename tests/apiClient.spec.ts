import { RequestInfo } from 'node-fetch';
import APIClient, { RequestOptionsParams } from '../src/apiClient';
import {
  NylasApiError,
  NylasOAuthError,
  NylasSdkTimeoutError,
} from '../src/models/error';
import { SDK_VERSION } from '../src/version';
import { mockedFetch, mockResponse } from './testUtils';

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch');
  return {
    ...originalModule,
    default: jest.fn(),
  };
});

describe('APIClient', () => {
  describe('constructor', () => {
    it('should initialize all the values', () => {
      const client = new APIClient({
        apiKey: 'test',
        apiUri: 'https://test.api.nylas.com',
        timeout: 30,
        headers: {
          'X-SDK-Test-Header': 'This is a test',
        },
      });

      expect(client.apiKey).toBe('test');
      expect(client.serverUrl).toBe('https://test.api.nylas.com');
      expect(client.timeout).toBe(30000);
      expect(client.headers).toEqual({
        'X-SDK-Test-Header': 'This is a test',
      });
    });
  });

  describe('request functions', () => {
    let client: APIClient;

    beforeAll(() => {
      client = new APIClient({
        apiKey: 'testApiKey',
        apiUri: 'https://api.us.nylas.com',
        timeout: 30,
        headers: {},
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
          'User-Agent': `Nylas Node SDK v${SDK_VERSION}`,
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
          'User-Agent': `Nylas Node SDK v${SDK_VERSION}`,
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

      it('should handle all the different types of query params', () => {
        const options = client.requestOptions({
          path: '/test',
          method: 'GET',
          queryParams: {
            foo: 'bar',
            list: ['a', 'b', 'c'],
            map: { key1: 'value1', key2: 'value2' },
          },
        });

        expect(options.url).toEqual(
          new URL(
            'https://api.us.nylas.com/test?foo=bar&list=a&list=b&list=c&map=key1%3Avalue1&map=key2%3Avalue2'
          )
        );
      });

      it('should handle repeated query parameters', () => {
        const options = client.requestOptions({
          path: '/test',
          method: 'GET',
          queryParams: {
            eventType: ['default', 'outOfOffice', 'focusTime'],
          },
        });

        expect(options.url).toEqual(
          new URL(
            'https://api.us.nylas.com/test?event_type=default&event_type=outOfOffice&event_type=focusTime'
          )
        );
      });

      it('should not convert metadata object keys to snake_case', () => {
        const metadata = {
          key0: 'value',
          key1: 'another',
          camelCase: true,
          snake_case: false,
          normal: 'yes',
        };
        const expectedBody = JSON.stringify({
          metadata: metadata,
        });

        const options = client.requestOptions({
          path: '/test',
          method: 'POST',
          body: {
            metadata: metadata,
          },
        });

        expect(options.body).toEqual(expectedBody);
      });
    });

    describe('newRequest', () => {
      it('should set all the fields properly', () => {
        client.headers = {
          'global-header': 'global-value',
        };

        const options: RequestOptionsParams = {
          path: '/test',
          method: 'POST',
          headers: { 'X-SDK-Test-Header': 'This is a test' },
          queryParams: { param: 'value' },
          body: { id: 'abc123' },
          overrides: {
            apiUri: 'https://override.api.nylas.com',
            headers: { override: 'bar' },
          },
        };
        const newRequest = client.newRequest(options);

        expect(newRequest.method).toBe('POST');
        expect(newRequest.headers.raw()).toEqual({
          Accept: ['application/json'],
          Authorization: ['Bearer testApiKey'],
          'Content-Type': ['application/json'],
          'User-Agent': [`Nylas Node SDK v${SDK_VERSION}`],
          'X-SDK-Test-Header': ['This is a test'],
          'global-header': ['global-value'],
          override: ['bar'],
        });
        expect(newRequest.url).toEqual(
          'https://override.api.nylas.com/test?param=value'
        );
        expect(newRequest.body?.toString()).toBe('{"id":"abc123"}');
      });
    });

    describe('requestWithResponse', () => {
      it('should return the data if the response is valid', async () => {
        const mockFlowId = 'test-flow-123';
        const mockHeaders = {
          'x-request-id': 'req-123',
          'x-nylas-api-version': 'v3',
        };

        const payload = {
          id: 123,
          name: 'test',
          isValid: true,
        };

        const mockResp = mockResponse(JSON.stringify(payload));
        mockResp.headers.set('x-fastly-id', mockFlowId);
        Object.entries(mockHeaders).forEach(([key, value]) => {
          mockResp.headers.set(key, value);
        });

        const requestWithResponse = await client.requestWithResponse(mockResp);

        expect(requestWithResponse).toEqual({
          ...payload,
          flowId: mockFlowId,
          headers: {
            xFastlyId: mockFlowId,
            xNylasApiVersion: mockHeaders['x-nylas-api-version'],
            xRequestId: mockHeaders['x-request-id'],
          },
        });
        expect((requestWithResponse as any).flowId).toBe(mockFlowId);
        expect((requestWithResponse as any).headers['xFastlyId']).toBe(
          mockFlowId
        );
        expect((requestWithResponse as any).headers['xRequestId']).toBe(
          mockHeaders['x-request-id']
        );
      });
    });

    describe('request', () => {
      it('should return a response if the response is valid', async () => {
        const mockFlowId = 'test-flow-abc';
        const mockHeaders = {
          'x-request-id': 'req-abc',
          'x-nylas-api-version': 'v3',
        };

        const payload = {
          id: 123,
          name: 'test',
          isValid: true,
        };

        const mockResp = mockResponse(JSON.stringify(payload));
        mockResp.headers.set('x-fastly-id', mockFlowId);
        Object.entries(mockHeaders).forEach(([key, value]) => {
          mockResp.headers.set(key, value);
        });

        mockedFetch.mockImplementationOnce(() => Promise.resolve(mockResp));

        const response = await client.request({
          path: '/test',
          method: 'GET',
        });

        expect(response).toEqual({
          ...payload,
          flowId: mockFlowId,
          headers: {
            xFastlyId: mockFlowId,
            xNylasApiVersion: mockHeaders['x-nylas-api-version'],
            xRequestId: mockHeaders['x-request-id'],
          },
        });
        expect((response as any).flowId).toBe(mockFlowId);
        expect((response as any).headers['xFastlyId']).toBe(mockFlowId);
      });

      it('should throw an error if the response is undefined', async () => {
        mockedFetch.mockImplementationOnce(() =>
          Promise.resolve(undefined as any)
        );

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
        mockedFetch.mockImplementationOnce(() =>
          Promise.resolve(mockResponse(JSON.stringify(payload), 400))
        );

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
        const mockFlowId = 'auth-flow-123';
        const mockHeaders = {
          'x-request-id': 'auth-req-123',
          'x-nylas-api-version': 'v3',
        };

        const payload = {
          requestId: 'abc123',
          error: 'Test error',
          errorCode: 400,
          errorDescription: 'Nylas SDK Test error',
          errorUri: 'https://test.api.nylas.com/docs/errors#test-error',
        };

        const mockResp = mockResponse(JSON.stringify(payload), 400);
        mockResp.headers.set('x-fastly-id', mockFlowId);
        mockResp.headers.set('x-request-id', mockHeaders['x-request-id']);
        mockResp.headers.set(
          'x-nylas-api-version',
          mockHeaders['x-nylas-api-version']
        );

        mockedFetch.mockImplementation(() => Promise.resolve(mockResp));

        try {
          await client.request({
            path: '/connect/token',
            method: 'POST',
          });
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(NylasOAuthError);
          expect((error as NylasOAuthError).flowId).toBe(mockFlowId);
          expect((error as NylasOAuthError).headers).toBeDefined();
        }

        try {
          await client.request({
            path: '/connect/revoke',
            method: 'POST',
          });
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(NylasOAuthError);
          expect((error as NylasOAuthError).flowId).toBe(mockFlowId);
          expect((error as NylasOAuthError).headers).toBeDefined();
        }
      });

      it('should throw a NylasApiError if the error comes from the other non-auth endpoints', async () => {
        const mockFlowId = 'api-flow-456';
        const mockHeaders = {
          'x-request-id': 'api-req-456',
          'x-nylas-api-version': 'v3',
        };

        const payload = {
          requestId: 'abc123',
          error: {
            type: 'invalid_request_error',
            message: 'Invalid request',
          },
        };

        const mockResp = mockResponse(JSON.stringify(payload), 400);
        mockResp.headers.set('x-fastly-id', mockFlowId);
        mockResp.headers.set('x-request-id', mockHeaders['x-request-id']);
        mockResp.headers.set(
          'x-nylas-api-version',
          mockHeaders['x-nylas-api-version']
        );

        mockedFetch.mockImplementation(() => Promise.resolve(mockResp));

        try {
          await client.request({
            path: '/events',
            method: 'POST',
          });
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(NylasApiError);
          expect((error as NylasApiError).flowId).toBe(mockFlowId);
          expect((error as NylasApiError).headers).toBeDefined();
        }
      });

      it('should respect override timeout when provided in seconds (value < 1000)', async () => {
        const overrideTimeout = 2; // 2 second timeout

        mockedFetch.mockImplementationOnce((_url: RequestInfo) => {
          // Immediately throw an AbortError to simulate a timeout
          const error = new Error('The operation was aborted');
          error.name = 'AbortError';
          return Promise.reject(error);
        });

        await expect(
          client.request({
            path: '/test',
            method: 'GET',
            overrides: { timeout: overrideTimeout },
          })
        ).rejects.toThrow(
          new NylasSdkTimeoutError(
            'https://api.us.nylas.com/test',
            overrideTimeout // Should remain as seconds in error
          )
        );
      });

      it('should respect override timeout when provided in milliseconds (value >= 1000) for backward compatibility', async () => {
        // Spy on console.warn to check for deprecation warning
        const originalWarn = console.warn;
        console.warn = jest.fn();

        try {
          const overrideTimeoutMs = 2000; // 2000 milliseconds (2 seconds)

          mockedFetch.mockImplementationOnce((_url: RequestInfo) => {
            // Immediately throw an AbortError to simulate a timeout
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            return Promise.reject(error);
          });

          await expect(
            client.request({
              path: '/test',
              method: 'GET',
              overrides: { timeout: overrideTimeoutMs },
            })
          ).rejects.toThrow(
            new NylasSdkTimeoutError(
              'https://api.us.nylas.com/test',
              overrideTimeoutMs / 1000 // Should be converted to seconds for error
            )
          );

          // Check that deprecation warning was shown
          expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('DEPRECATED: Providing timeout in milliseconds')
          );
        } finally {
          console.warn = originalWarn;
        }
      });

      it('should convert override timeout from seconds to milliseconds for setTimeout when value < 1000', async () => {
        // We need to mock setTimeout to verify it's called with the correct duration
        const originalSetTimeout = global.setTimeout;
        const mockSetTimeout = jest.fn().mockImplementation(() => 123); // Return a timeout ID
        global.setTimeout = mockSetTimeout;

        try {
          // Mock fetch to return a successful response so we can verify setTimeout
          mockedFetch.mockImplementationOnce(() => 
            Promise.resolve(mockResponse(JSON.stringify({ data: 'test' })))
          );

          const overrideTimeout = 7; // 7 seconds

          await client.request({
            path: '/test',
            method: 'GET',
            overrides: { timeout: overrideTimeout },
          });

          // Verify setTimeout was called with the timeout in milliseconds (7 seconds = 7000ms)
          expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), overrideTimeout * 1000);
        } finally {
          // Restore the original setTimeout
          global.setTimeout = originalSetTimeout;
        }
      });

      it('should keep override timeout in milliseconds for setTimeout when value >= 1000 (backward compatibility)', async () => {
        // Spy on console.warn to check for deprecation warning
        const originalWarn = console.warn;
        console.warn = jest.fn();
        
        // We need to mock setTimeout to verify it's called with the correct duration
        const originalSetTimeout = global.setTimeout;
        const mockSetTimeout = jest.fn().mockImplementation(() => 123); // Return a timeout ID
        global.setTimeout = mockSetTimeout;

        try {
          // Mock fetch to return a successful response so we can verify setTimeout
          mockedFetch.mockImplementationOnce(() => 
            Promise.resolve(mockResponse(JSON.stringify({ data: 'test' })))
          );

          const overrideTimeoutMs = 5000; // 5000 milliseconds (5 seconds)

          await client.request({
            path: '/test',
            method: 'GET',
            overrides: { timeout: overrideTimeoutMs },
          });

          // Verify setTimeout was called with the timeout directly in milliseconds
          expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), overrideTimeoutMs);
          
          // Check that deprecation warning was shown
          expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('DEPRECATED: Providing timeout in milliseconds')
          );
        } finally {
          // Restore the original setTimeout and console.warn
          global.setTimeout = originalSetTimeout;
          console.warn = originalWarn;
        }
      });

      it('should use default timeout when no override provided', async () => {
        mockedFetch.mockImplementationOnce((_url: RequestInfo) => {
          // Immediately throw an AbortError to simulate a timeout
          const error = new Error('The operation was aborted');
          error.name = 'AbortError';
          return Promise.reject(error);
        });

        await expect(
          client.request({
            path: '/test',
            method: 'GET',
          })
        ).rejects.toThrow(
          new NylasSdkTimeoutError(
            'https://api.us.nylas.com/test',
            client.timeout
          )
        );
      });

      it('should complete request within timeout period', async () => {
        const mockFlowId = 'success-flow-789';
        const mockHeaders = {
          'x-request-id': 'success-req-789',
          'x-nylas-api-version': 'v3',
        };

        const payload = {
          data: 'test',
        };

        const mockResp = mockResponse(JSON.stringify(payload));
        mockResp.headers.set('x-fastly-id', mockFlowId);
        Object.entries(mockHeaders).forEach(([key, value]) => {
          mockResp.headers.set(key, value);
        });

        mockedFetch.mockImplementationOnce(() => Promise.resolve(mockResp));

        const result = await client.request({
          path: '/test',
          method: 'GET',
        });

        expect(result).toEqual({
          ...payload,
          flowId: mockFlowId,
          headers: {
            xFastlyId: mockFlowId,
            xNylasApiVersion: mockHeaders['x-nylas-api-version'],
            xRequestId: mockHeaders['x-request-id'],
          },
        });
        expect((result as any).flowId).toBe(mockFlowId);
        expect((result as any).headers['xFastlyId']).toBe(mockFlowId);
      });
    });
  });
});
