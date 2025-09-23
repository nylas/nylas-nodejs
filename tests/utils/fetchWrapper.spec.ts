/**
 * Tests for main fetchWrapper implementation (CJS-based)
 */

// Store original global functions
const _originalGlobal = global;
const originalFunction = global.Function;

// Mock the dynamic import to avoid actually importing node-fetch
const mockNodeFetchMain = {
  default: jest.fn().mockName('mockFetch'),
  Request: jest.fn().mockName('mockRequest'),
  Response: jest.fn().mockName('mockResponse'),
};

// Mock the Function constructor used for dynamic imports
const mockDynamicImportMain = jest.fn().mockResolvedValue(mockNodeFetchMain);

describe('fetchWrapper (main)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    // Setup mocked Function constructor
    global.Function = jest.fn().mockImplementation(() => mockDynamicImportMain);
  });

  describe('integration with apiClient usage patterns', () => {
    it('should work with typical apiClient.request() usage', async () => {
      const mockGlobalFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' }),
        headers: new Map([['content-type', 'application/json']]),
      });
      (global as any).fetch = mockGlobalFetch;

      const { getFetch } = await import('../../src/utils/fetchWrapper.js');
      const fetch = await getFetch();
      const response = await fetch('https://api.nylas.com/v3/grants', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
        },
      });

      expect(mockGlobalFetch).toHaveBeenCalledWith(
        'https://api.nylas.com/v3/grants',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer token',
            'Content-Type': 'application/json',
          },
        }
      );
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
    });

    it('should work with apiClient.newRequest() usage pattern', async () => {
      const mockGlobalRequest = jest
        .fn()
        .mockImplementation((url, options) => ({
          url,
          method: options?.method || 'GET',
          headers: new Map(Object.entries(options?.headers || {})),
          body: options?.body,
        }));
      (global as any).Request = mockGlobalRequest;

      const { getRequest } = await import('../../src/utils/fetchWrapper.js');
      const Request = await getRequest();
      const request = new Request('https://api.nylas.com/v3/grants/123', {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Updated Grant' }),
      });

      expect(mockGlobalRequest).toHaveBeenCalledWith(
        'https://api.nylas.com/v3/grants/123',
        {
          method: 'PUT',
          headers: {
            Authorization: 'Bearer token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: 'Updated Grant' }),
        }
      );
      expect(request.method).toBe('PUT');
      expect(request.url).toBe('https://api.nylas.com/v3/grants/123');
    });
  });

  describe('consistency with CJS implementation', () => {
    it('should behave identically to fetchWrapper-cjs', async () => {
      const mockGlobalFetch = jest.fn().mockName('globalFetch');
      (global as any).fetch = mockGlobalFetch;

      const { getFetch } = await import('../../src/utils/fetchWrapper.js');
      const fetch = await getFetch();
      expect(fetch).toBe(mockGlobalFetch);
    });

    it('should use dynamic imports when globals are not available', async () => {
      delete (global as any).fetch;
      delete (global as any).Request;
      delete (global as any).Response;

      const { getFetch, getRequest, getResponse } = await import(
        '../../src/utils/fetchWrapper.js'
      );
      const fetch = await getFetch();
      const Request = await getRequest();
      const Response = await getResponse();

      expect(mockDynamicImportMain).toHaveBeenCalledWith('node-fetch');
      expect(fetch).toBe(mockNodeFetchMain.default);
      expect(Request).toBe(mockNodeFetchMain.Request);
      expect(Response).toBe(mockNodeFetchMain.Response);
    });
  });

  describe('basic functionality', () => {
    it('should return functions for all methods', async () => {
      delete (global as any).fetch;
      delete (global as any).Request;
      delete (global as any).Response;

      const { getFetch, getRequest, getResponse } = await import(
        '../../src/utils/fetchWrapper.js'
      );

      const fetch = await getFetch();
      const Request = await getRequest();
      const Response = await getResponse();

      expect(typeof fetch).toBe('function');
      expect(typeof Request).toBe('function');
      expect(typeof Response).toBe('function');
    });

    it('should prefer global objects when available', async () => {
      const mockGlobalFetch = jest.fn();
      const mockGlobalRequest = jest.fn();
      const mockGlobalResponse = jest.fn();

      (global as any).fetch = mockGlobalFetch;
      (global as any).Request = mockGlobalRequest;
      (global as any).Response = mockGlobalResponse;

      const { getFetch, getRequest, getResponse } = await import(
        '../../src/utils/fetchWrapper.js'
      );
      const fetch = await getFetch();
      const Request = await getRequest();
      const Response = await getResponse();

      expect(fetch).toBe(mockGlobalFetch);
      expect(Request).toBe(mockGlobalRequest);
      expect(Response).toBe(mockGlobalResponse);
    });
  });

  describe('environment detection', () => {
    it('should detect test environment correctly', async () => {
      const mockGlobalFetch = jest.fn();
      (global as any).fetch = mockGlobalFetch;

      const { getFetch } = await import('../../src/utils/fetchWrapper.js');
      const fetch = await getFetch();
      expect(fetch).toBe(mockGlobalFetch);
    });

    it('should handle missing global object', async () => {
      // Simulate environment where global is not defined
      const _localOriginalGlobal = global;
      (global as any) = undefined;

      const { getFetch } = await import('../../src/utils/fetchWrapper.js');
      const fetch = await getFetch();
      expect(mockDynamicImportMain).toHaveBeenCalledWith('node-fetch');
      expect(fetch).toBe(mockNodeFetchMain.default);

      // Restore global
      (global as any) = _localOriginalGlobal;
    });
  });

  afterEach(() => {
    // Clean up global modifications
    delete (global as any).fetch;
    delete (global as any).Request;
    delete (global as any).Response;
    // Restore original Function constructor
    global.Function = originalFunction;
  });
});
