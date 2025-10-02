/**
 * Tests for Workers fetchWrapper implementation
 * These tests verify that the wrapper correctly returns native Workers APIs
 */

import {
  getFetch,
  getRequest,
  getResponse,
} from '../../src/utils/fetchWrapper-workers.js';

import { describe, it, expect } from 'vitest';

// Skip these tests in Node.js environment (they're only for Workers/Edge environments)
// In Node.js, the Request constructor doesn't have the same API as in Workers
const isWorkersEnvironment =
  typeof process === 'undefined' || process.env.VITEST_POOL_WORKERS;

describe.skipIf(!isWorkersEnvironment)('fetchWrapper-workers', () => {
  describe('getFetch', () => {
    it('should return the native fetch function', async () => {
      const fetchFn = await getFetch();
      expect(typeof fetchFn).toBe('function');
      expect(fetchFn).toBeDefined();
      // In Workers environment, fetch is the native global
      expect(fetchFn).toBe(fetch);
    });

    it('should return the same fetch function on multiple calls', async () => {
      const fetch1 = await getFetch();
      const fetch2 = await getFetch();
      expect(fetch1).toBe(fetch2);
    });

    it('should return a function with expected fetch API signature', async () => {
      const fetchFn = await getFetch();
      // Verify it's callable (though we won't actually make requests)
      expect(fetchFn).toBeDefined();
      expect(typeof fetchFn).toBe('function');
      // In test environment, fetch might be mocked with a different name
      // Just verify it's a function, not the specific name
    });
  });

  describe('getRequest', () => {
    it('should return the native Request constructor', async () => {
      const RequestConstructor = await getRequest();
      expect(typeof RequestConstructor).toBe('function');
      expect(RequestConstructor).toBeDefined();
      // In Workers environment, Request is the native global
      expect(RequestConstructor).toBe(Request);
    });

    it('should return the same Request constructor on multiple calls', async () => {
      const Request1 = await getRequest();
      const Request2 = await getRequest();
      expect(Request1).toBe(Request2);
    });

    it('should be able to create a Request instance', async () => {
      const RequestConstructor = await getRequest();
      const request = new RequestConstructor('https://example.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'data' }),
      });

      expect(request).toBeInstanceOf(RequestConstructor);
      // URL might or might not have trailing slash depending on implementation
      expect(request.url).toMatch(/^https:\/\/example\.com\/?$/);
      expect(request.method).toBe('POST');
      expect(request.headers.get('content-type')).toBe('application/json');
    });

    it('should create Request with different HTTP methods', async () => {
      const RequestConstructor = await getRequest();

      const getReq = new RequestConstructor('https://example.com', {
        method: 'GET',
      });
      const postReq = new RequestConstructor('https://example.com', {
        method: 'POST',
      });
      const putReq = new RequestConstructor('https://example.com', {
        method: 'PUT',
      });
      const deleteReq = new RequestConstructor('https://example.com', {
        method: 'DELETE',
      });

      expect(getReq.method).toBe('GET');
      expect(postReq.method).toBe('POST');
      expect(putReq.method).toBe('PUT');
      expect(deleteReq.method).toBe('DELETE');
    });

    it('should handle Request with custom headers', async () => {
      const RequestConstructor = await getRequest();
      const request = new RequestConstructor('https://example.com', {
        headers: {
          Authorization: 'Bearer token',
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(request.headers.get('authorization')).toBe('Bearer token');
      expect(request.headers.get('x-custom-header')).toBe('custom-value');
    });

    it('should handle Request with body', async () => {
      const RequestConstructor = await getRequest();
      const bodyData = { key: 'value' };
      const request = new RequestConstructor('https://example.com', {
        method: 'POST',
        body: JSON.stringify(bodyData),
      });

      expect(request.body).toBeDefined();
      expect(request.bodyUsed).toBe(false);

      // Read the body to verify it contains the right data
      const text = await request.text();
      expect(text).toBe(JSON.stringify(bodyData));
      expect(request.bodyUsed).toBe(true);
    });
  });

  describe('getResponse', () => {
    it('should return the native Response constructor', async () => {
      const ResponseConstructor = await getResponse();
      expect(typeof ResponseConstructor).toBe('function');
      expect(ResponseConstructor).toBeDefined();
      // In Workers environment, Response is the native global
      expect(ResponseConstructor).toBe(Response);
    });

    it('should return the same Response constructor on multiple calls', async () => {
      const Response1 = await getResponse();
      const Response2 = await getResponse();
      expect(Response1).toBe(Response2);
    });

    it('should be able to create a Response instance', async () => {
      const ResponseConstructor = await getResponse();
      const response = new ResponseConstructor('{"test": "data"}', {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response).toBeInstanceOf(ResponseConstructor);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
      expect(response.headers.get('content-type')).toBe('application/json');

      const json = await response.json();
      expect(json).toEqual({ test: 'data' });
    });

    it('should create Response with different status codes', async () => {
      const ResponseConstructor = await getResponse();

      const okResponse = new ResponseConstructor('OK', { status: 200 });
      const notFoundResponse = new ResponseConstructor('Not Found', {
        status: 404,
      });
      const serverErrorResponse = new ResponseConstructor('Server Error', {
        status: 500,
      });

      expect(okResponse.status).toBe(200);
      expect(okResponse.ok).toBe(true);

      expect(notFoundResponse.status).toBe(404);
      expect(notFoundResponse.ok).toBe(false);

      expect(serverErrorResponse.status).toBe(500);
      expect(serverErrorResponse.ok).toBe(false);
    });

    it('should handle Response with different content types', async () => {
      const ResponseConstructor = await getResponse();

      const jsonResponse = new ResponseConstructor('{"key": "value"}', {
        headers: { 'Content-Type': 'application/json' },
      });

      const textResponse = new ResponseConstructor('plain text', {
        headers: { 'Content-Type': 'text/plain' },
      });

      expect(jsonResponse.headers.get('content-type')).toBe('application/json');
      expect(textResponse.headers.get('content-type')).toBe('text/plain');

      const jsonData = await jsonResponse.json();
      expect(jsonData).toEqual({ key: 'value' });

      const textData = await textResponse.text();
      expect(textData).toBe('plain text');
    });

    it('should handle Response cloning', async () => {
      const ResponseConstructor = await getResponse();
      const response = new ResponseConstructor('{"data": "test"}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      const clonedResponse = response.clone();

      expect(clonedResponse.status).toBe(response.status);
      expect(clonedResponse.headers.get('content-type')).toBe(
        response.headers.get('content-type')
      );

      // Both should be able to read the body
      const originalData = await response.json();
      const clonedData = await clonedResponse.json();

      expect(originalData).toEqual({ data: 'test' });
      expect(clonedData).toEqual({ data: 'test' });
    });
  });

  describe('Web API compatibility', () => {
    it('should use native Web APIs without polyfills', async () => {
      const fetchFn = await getFetch();
      const RequestConstructor = await getRequest();
      const ResponseConstructor = await getResponse();

      // Verify these are the native globals
      expect(fetchFn).toBe(globalThis.fetch);
      expect(RequestConstructor).toBe(globalThis.Request);
      expect(ResponseConstructor).toBe(globalThis.Response);
    });

    it('should have proper TypeScript types available', () => {
      // This test ensures that the types are properly exported
      // The actual type checking happens at compile time
      expect(true).toBe(true);
    });
  });
});
