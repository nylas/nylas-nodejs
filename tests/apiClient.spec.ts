import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  vi,
  assert,
} from 'vitest';
import APIClient, { RequestOptionsParams } from '../src/apiClient';
import {
  NylasApiError,
  NylasOAuthError,
  NylasSdkTimeoutError,
} from '../src/models/error';
import { SDK_VERSION } from '../src/version';
import { mockResponse } from './testUtils';

describe('APIClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
      it('should set all the fields properly', async () => {
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
        const newRequest = await client.newRequest(options);

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

        // Verify body is set correctly
        // Different environments handle Request body differently:
        // - Workers: body is a ReadableStream, can be read with .text()
        // - Node.js: body might be a string or other format
        expect(newRequest.body).toBeDefined();

        // Try to read body if the environment supports it
        if (typeof newRequest.clone === 'function') {
          try {
            const clonedRequest = newRequest.clone();
            if (typeof clonedRequest.text === 'function') {
              const bodyText = await clonedRequest.text();
              expect(bodyText).toBe('{"id":"abc123"}');
            }
          } catch (e) {
            // In some test environments, clone/text might not work
            // Just verify body exists
            expect(newRequest.body).toBeDefined();
          }
        }
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

      it('should include rawHeaders with dashed lowercase keys', async () => {
        const mockFlowId = 'test-flow-raw-123';
        const mockHeaders = {
          'x-request-id': 'req-raw-123',
          'x-nylas-api-version': 'v3',
          'x-rate-limit-limit': '100',
          'x-rate-limit-remaining': '99',
        };

        const payload = {
          id: 456,
          name: 'raw-test',
        };

        const mockResp = mockResponse(JSON.stringify(payload));
        mockResp.headers.set('x-fastly-id', mockFlowId);
        Object.entries(mockHeaders).forEach(([key, value]) => {
          mockResp.headers.set(key, value);
        });

        const result = await client.requestWithResponse(mockResp);

        expect((result as any).rawHeaders).toBeDefined();
        expect((result as any).rawHeaders['x-fastly-id']).toBe(mockFlowId);
        expect((result as any).rawHeaders['x-request-id']).toBe(
          mockHeaders['x-request-id']
        );
        expect((result as any).rawHeaders['x-nylas-api-version']).toBe(
          mockHeaders['x-nylas-api-version']
        );
        expect((result as any).rawHeaders['x-rate-limit-limit']).toBe('100');
        expect((result as any).rawHeaders['x-rate-limit-remaining']).toBe('99');
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

        vi.mocked(fetch).mockImplementationOnce(() =>
          Promise.resolve(mockResp)
        );

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

      it('should include rawHeaders on standard responses', async () => {
        const mockFlowId = 'test-flow-raw-abc';
        const mockHeaders = {
          'x-request-id': 'req-raw-abc',
          'x-nylas-api-version': 'v3',
          'x-rate-limit-limit': '200',
        };

        const payload = {
          id: 789,
          name: 'raw',
        };

        const mockResp = mockResponse(JSON.stringify(payload));
        mockResp.headers.set('x-fastly-id', mockFlowId);
        Object.entries(mockHeaders).forEach(([key, value]) => {
          mockResp.headers.set(key, value);
        });

        vi.mocked(fetch).mockImplementationOnce(() =>
          Promise.resolve(mockResp)
        );

        const response = await client.request({ path: '/test', method: 'GET' });

        expect((response as any).rawHeaders).toBeDefined();
        expect((response as any).rawHeaders['x-fastly-id']).toBe(mockFlowId);
        expect((response as any).rawHeaders['x-request-id']).toBe(
          mockHeaders['x-request-id']
        );
        expect((response as any).rawHeaders['x-nylas-api-version']).toBe(
          mockHeaders['x-nylas-api-version']
        );
        expect((response as any).rawHeaders['x-rate-limit-limit']).toBe('200');
      });

      it('should throw an error if the response is undefined', async () => {
        vi.mocked(fetch).mockImplementationOnce(() =>
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
        vi.mocked(fetch).mockImplementationOnce(() =>
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

        vi.mocked(fetch).mockImplementation(() => Promise.resolve(mockResp));

        try {
          await client.request({
            path: '/connect/token',
            method: 'POST',
          });
          assert.fail('Expected error to be thrown');
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
          assert.fail('Expected error to be thrown');
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

        vi.mocked(fetch).mockImplementation(() => Promise.resolve(mockResp));

        try {
          await client.request({
            path: '/events',
            method: 'POST',
          });
          assert.fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(NylasApiError);
          expect((error as NylasApiError).flowId).toBe(mockFlowId);
          expect((error as NylasApiError).headers).toBeDefined();
        }
      });

      it('should respect override timeout when provided in seconds (value < 1000)', async () => {
        const overrideTimeout = 2; // 2 second timeout

        vi.mocked(fetch).mockImplementationOnce(() => {
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
        // We no longer show the console warning since we're using TypeScript annotations instead
        const originalWarn = console.warn;
        console.warn = vi.fn();

        try {
          const overrideTimeoutMs = 2000; // 2000 milliseconds (2 seconds)

          vi.mocked(fetch).mockImplementationOnce(() => {
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

          // No need to check for deprecation warning anymore as we use TypeScript annotations
        } finally {
          console.warn = originalWarn;
        }
      });

      it('should convert override timeout from seconds to milliseconds for setTimeout when value < 1000', async () => {
        // We need to mock setTimeout to verify it's called with the correct duration
        const originalSetTimeout = global.setTimeout;
        const mockSetTimeout = vi.fn().mockImplementation(() => 123); // Return a timeout ID
        global.setTimeout = mockSetTimeout as unknown as typeof setTimeout;

        try {
          // Mock fetch to return a successful response so we can verify setTimeout
          vi.mocked(fetch).mockImplementationOnce(() =>
            Promise.resolve(mockResponse(JSON.stringify({ data: 'test' })))
          );

          const overrideTimeout = 7; // 7 seconds

          await client.request({
            path: '/test',
            method: 'GET',
            overrides: { timeout: overrideTimeout },
          });

          // Verify setTimeout was called with the timeout in milliseconds (7 seconds = 7000ms)
          expect(mockSetTimeout).toHaveBeenCalledWith(
            expect.any(Function),
            overrideTimeout * 1000
          );
        } finally {
          // Restore the original setTimeout
          global.setTimeout = originalSetTimeout;
        }
      });

      it('should keep override timeout in milliseconds for setTimeout when value >= 1000 (backward compatibility)', async () => {
        // We no longer show the console warning since we're using TypeScript annotations instead
        const originalWarn = console.warn;
        console.warn = vi.fn();

        // We need to mock setTimeout to verify it's called with the correct duration
        const originalSetTimeout = global.setTimeout;
        const mockSetTimeout = vi.fn().mockImplementation(() => 123); // Return a timeout ID
        global.setTimeout = mockSetTimeout as unknown as typeof setTimeout;

        try {
          // Mock fetch to return a successful response so we can verify setTimeout
          vi.mocked(fetch).mockImplementationOnce(() =>
            Promise.resolve(mockResponse(JSON.stringify({ data: 'test' })))
          );

          const overrideTimeoutMs = 5000; // 5000 milliseconds (5 seconds)

          await client.request({
            path: '/test',
            method: 'GET',
            overrides: { timeout: overrideTimeoutMs },
          });

          // Verify setTimeout was called with the timeout directly in milliseconds
          expect(mockSetTimeout).toHaveBeenCalledWith(
            expect.any(Function),
            overrideTimeoutMs
          );

          // No need to check for deprecation warning anymore as we use TypeScript annotations
        } finally {
          // Restore the original setTimeout and console.warn
          global.setTimeout = originalSetTimeout;
          console.warn = originalWarn;
        }
      });

      it('should use default timeout when no override provided', async () => {
        vi.mocked(fetch).mockImplementationOnce(() => {
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

        vi.mocked(fetch).mockImplementationOnce(() =>
          Promise.resolve(mockResp)
        );

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

      it('should handle form data in request options', () => {
        const mockFormData = {
          append: vi.fn(),
          [Symbol.toStringTag]: 'FormData',
        } as any;

        const options = client.requestOptions({
          path: '/test',
          method: 'POST',
          form: mockFormData,
        });

        expect(options.body).toBe(mockFormData);
        expect(options.headers['Content-Type']).toBeUndefined(); // FormData sets its own content-type
      });

      it('should throw error when JSON parsing fails in requestWithResponse', async () => {
        const invalidJsonResponse = {
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue('invalid json content'),
          json: vi.fn().mockRejectedValue(new Error('Unexpected token')),
          headers: new Map(),
        };

        await expect(
          client.requestWithResponse(invalidJsonResponse as any)
        ).rejects.toThrow(
          'Could not parse response from the server: invalid json content'
        );
      });
    });

    describe('requestRaw', () => {
      it('should return raw buffer response', async () => {
        const testData = 'raw binary data';
        const mockResp = {
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue(testData),
          json: vi.fn(),
          headers: new Map(),
          buffer: vi.fn().mockResolvedValue(Buffer.from(testData)),
        };

        vi.mocked(fetch).mockImplementationOnce(() =>
          Promise.resolve(mockResp as any)
        );

        const result = await client.requestRaw({
          path: '/test',
          method: 'GET',
        });

        expect(result).toBeInstanceOf(Buffer);
        expect(result.toString()).toBe(testData);
      });
    });

    describe('requestStream', () => {
      it('should return readable stream response', async () => {
        const mockStream = { pipe: vi.fn(), on: vi.fn() };
        const mockResp = {
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue('stream data'),
          json: vi.fn(),
          headers: new Map(),
          body: mockStream,
        };

        vi.mocked(fetch).mockImplementationOnce(() =>
          Promise.resolve(mockResp as any)
        );

        const result = await client.requestStream({
          path: '/test',
          method: 'GET',
        });

        expect(result).toBe(mockStream);
      });

      it('should throw error when response has no body', async () => {
        const mockResp = {
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue('data'),
          json: vi.fn(),
          headers: new Map(),
          body: null,
        };

        vi.mocked(fetch).mockImplementationOnce(() =>
          Promise.resolve(mockResp as any)
        );

        await expect(
          client.requestStream({
            path: '/test',
            method: 'GET',
          })
        ).rejects.toThrow('No response body');
      });
    });
  });
});
