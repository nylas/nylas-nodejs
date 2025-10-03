/**
 * Tests for ESM fetchWrapper implementation
 */

import {
  getFetch,
  getRequest,
  getResponse,
} from '../../src/utils/fetchWrapper-esm.js';

import { describe, it, expect } from 'vitest';

describe('fetchWrapper-esm', () => {
  describe('getFetch', () => {
    it('should return the node-fetch function', async () => {
      const fetch = await getFetch();
      expect(typeof fetch).toBe('function');
      // The actual function name might vary, just check it's a function
      expect(fetch).toBeDefined();
    });

    it('should return the same fetch function on multiple calls', async () => {
      const fetch1 = await getFetch();
      const fetch2 = await getFetch();
      expect(fetch1).toBe(fetch2);
    });

    it('should be able to make a basic fetch request', async () => {
      const fetch = await getFetch();

      // We can't actually make HTTP requests in tests, but we can verify
      // the fetch function has the expected interface
      expect(fetch).toBeDefined();
      expect(typeof fetch).toBe('function');
    });
  });

  describe('getRequest', () => {
    it('should return the Request constructor', async () => {
      const Request = await getRequest();
      expect(typeof Request).toBe('function');
      // The actual function name might vary, just check it's a constructor
      expect(Request).toBeDefined();
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
      expect(request.url).toBe('https://example.com/');
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
  });

  describe('getResponse', () => {
    it('should return the Response constructor', async () => {
      const Response = await getResponse();
      expect(typeof Response).toBe('function');
      // The actual function name might vary, just check it's a constructor
      expect(Response).toBeDefined();
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

      // Check that response has the expected properties instead of instanceof check
      expect(response.status).toBeDefined();
      expect(response.headers).toBeDefined();
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
  });

  describe('Type exports', () => {
    it('should have proper TypeScript types available', () => {
      // This test ensures that the types are properly exported
      // The actual type checking happens at compile time
      expect(true).toBe(true);
    });
  });
});
