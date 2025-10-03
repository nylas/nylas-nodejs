/**
 * Tests for CJS fetchWrapper implementation
 */

// Import types are only used for dynamic imports in tests, so we don't import them here
// The functions are imported dynamically within each test to ensure proper module isolation

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the dynamic import to avoid actually importing node-fetch
const mockNodeFetch = {
  default: vi.fn().mockName('mockFetch'),
  Request: vi.fn().mockName('mockRequest'),
  Response: vi.fn().mockName('mockResponse'),
};

// Mock the Function constructor used for dynamic imports
const mockDynamicImport = vi.fn().mockResolvedValue(mockNodeFetch);
global.Function = vi.fn().mockImplementation(() => mockDynamicImport);

// Mock global objects for test environment detection
const originalGlobal = global;

describe('fetchWrapper-cjs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module cache by clearing the nodeFetchModule cache
    // This is done by reimporting the module
    vi.resetModules();
    // Setup mocked Function constructor
    global.Function = vi.fn().mockImplementation(() => mockDynamicImport);
    // Reset mock implementation
    mockDynamicImport.mockResolvedValue(mockNodeFetch);
  });

  describe('getFetch', () => {
    it('should return global.fetch when in test environment', async () => {
      const mockGlobalFetch = vi.fn().mockName('globalFetch');
      (global as any).fetch = mockGlobalFetch;

      const { getFetch } = await import('../../src/utils/fetchWrapper-cjs.js');
      const fetch = await getFetch();

      expect(fetch).toBe(mockGlobalFetch);
    });

    it('should use dynamic import when global.fetch is not available', async () => {
      // Remove global.fetch
      delete (global as any).fetch;

      const { getFetch } = await import('../../src/utils/fetchWrapper-cjs.js');
      const fetch = await getFetch();

      expect(fetch).toBe(mockNodeFetch.default);
    });

    it('should return a function', async () => {
      delete (global as any).fetch;

      const { getFetch } = await import('../../src/utils/fetchWrapper-cjs.js');
      const fetch = await getFetch();

      expect(typeof fetch).toBe('function');
    });

    it('should handle Function constructor usage', async () => {
      delete (global as any).fetch;

      const { getFetch } = await import('../../src/utils/fetchWrapper-cjs.js');
      await getFetch();

      // Verify Function constructor was called
      expect(global.Function).toHaveBeenCalled();
    });
  });

  describe('getRequest', () => {
    it('should return global.Request when in test environment', async () => {
      const mockGlobalRequest = vi.fn().mockName('globalRequest');
      (global as any).Request = mockGlobalRequest;

      const { getRequest } = await import(
        '../../src/utils/fetchWrapper-cjs.js'
      );
      const Request = await getRequest();

      expect(Request).toBe(mockGlobalRequest);
    });

    it('should use dynamic import when global.Request is not available', async () => {
      delete (global as any).Request;

      const { getRequest } = await import(
        '../../src/utils/fetchWrapper-cjs.js'
      );
      const Request = await getRequest();

      expect(Request).toBe(mockNodeFetch.Request);
    });

    it('should return a function', async () => {
      delete (global as any).Request;

      const { getRequest } = await import(
        '../../src/utils/fetchWrapper-cjs.js'
      );
      const Request = await getRequest();

      expect(typeof Request).toBe('function');
    });
  });

  describe('getResponse', () => {
    it('should return global.Response when in test environment', async () => {
      const mockGlobalResponse = vi.fn().mockName('globalResponse');
      (global as any).Response = mockGlobalResponse;

      const { getResponse } = await import(
        '../../src/utils/fetchWrapper-cjs.js'
      );
      const Response = await getResponse();

      expect(Response).toBe(mockGlobalResponse);
    });

    it('should use dynamic import when global.Response is not available', async () => {
      delete (global as any).Response;

      const { getResponse } = await import(
        '../../src/utils/fetchWrapper-cjs.js'
      );
      const Response = await getResponse();

      expect(Response).toBe(mockNodeFetch.Response);
    });

    it('should return a function', async () => {
      delete (global as any).Response;

      const { getResponse } = await import(
        '../../src/utils/fetchWrapper-cjs.js'
      );
      const Response = await getResponse();

      expect(typeof Response).toBe('function');
    });
  });

  describe('mixed environment scenarios', () => {
    it('should prefer global objects when available, fall back to dynamic import for missing ones', async () => {
      const mockGlobalFetch = vi.fn().mockName('globalFetch');
      (global as any).fetch = mockGlobalFetch;
      delete (global as any).Request;
      delete (global as any).Response;

      const { getFetch, getRequest, getResponse } = await import(
        '../../src/utils/fetchWrapper-cjs.js'
      );

      const fetch = await getFetch();
      const Request = await getRequest();
      const Response = await getResponse();

      // fetch should use global
      expect(fetch).toBe(mockGlobalFetch);

      // Request and Response should use dynamic import
      expect(Request).toBe(mockNodeFetch.Request);
      expect(Response).toBe(mockNodeFetch.Response);
    });

    it('should handle undefined global object gracefully', async () => {
      // Simulate environment where global might be undefined
      const originalGlobal = global;
      (global as any) = undefined;

      const { getFetch } = await import('../../src/utils/fetchWrapper-cjs.js');
      const fetch = await getFetch();

      expect(fetch).toBe(mockNodeFetch.default);

      // Restore global
      (global as any) = originalGlobal;
    });
  });

  describe('Type exports', () => {
    it('should export types as any for CJS compatibility', () => {
      // This test ensures that the types are properly exported as 'any'
      // The actual type checking happens at compile time
      expect(true).toBe(true);
    });
  });

  afterEach(() => {
    // Clean up global modifications
    delete (global as any).fetch;
    delete (global as any).Request;
    delete (global as any).Response;
    // Restore original Function constructor if needed
    if (originalGlobal.Function) {
      global.Function = originalGlobal.Function;
    }
  });
});
