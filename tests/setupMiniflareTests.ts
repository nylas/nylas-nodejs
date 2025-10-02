import { vi } from 'vitest';

// Mock fetch for API testing - this will be used by the SDK to make HTTP requests
(global.fetch as any) = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: new Map(),
  json: vi.fn().mockResolvedValue({}),
  text: vi.fn().mockResolvedValue(''),
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  blob: vi.fn().mockResolvedValue(new Blob()),
  formData: vi.fn().mockResolvedValue(new FormData()),
  clone: vi.fn().mockReturnThis(),
  body: null,
  bodyUsed: false,
  url: '',
  type: 'basic',
  redirected: false,
});

// Store the original Request constructor
const OriginalRequest = globalThis.Request;

// Mock Request constructor to add headers.raw() method for compatibility with node-fetch tests
globalThis.Request = class MockRequest extends OriginalRequest {
  constructor(url: string | URL, options?: RequestInit) {
    super(url, options);

    // Store original header names to preserve casing
    const originalHeaderNames: Record<string, string> = {};
    if (options?.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((_value, key) => {
          originalHeaderNames[key.toLowerCase()] = key;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key]) => {
          originalHeaderNames[key.toLowerCase()] = key;
        });
      } else {
        Object.entries(options.headers).forEach(([key]) => {
          originalHeaderNames[key.toLowerCase()] = key;
        });
      }
    }

    // Add raw() method to headers for compatibility with node-fetch
    const originalHeaders = this.headers;
    (originalHeaders as any).raw = (): Record<string, string[]> => {
      const rawHeaders: Record<string, string[]> = {};
      originalHeaders.forEach((value, key) => {
        // Use original casing if available, otherwise use the key as-is
        const originalKey = originalHeaderNames[key.toLowerCase()] || key;
        rawHeaders[originalKey] = [value];
      });
      return rawHeaders;
    };
  }
} as any;

// Mock mime-types for Cloudflare Workers compatibility
// This is needed because mime-types uses CommonJS which doesn't work in Workers
vi.mock('mime-types', () => ({
  default: {
    lookup: vi.fn((filePath: string) => {
      // Simple mock implementation for common file types
      const ext = filePath.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        txt: 'text/plain',
        html: 'text/html',
        css: 'text/css',
        js: 'application/javascript',
        json: 'application/json',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        pdf: 'application/pdf',
        zip: 'application/zip',
      };
      return mimeTypes[ext || ''] || 'application/octet-stream';
    }),
  },
  lookup: vi.fn((filePath: string) => {
    // Simple mock implementation for common file types
    const ext = filePath.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      txt: 'text/plain',
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      json: 'application/json',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      pdf: 'application/pdf',
      zip: 'application/zip',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }),
}));

// Export for TypeScript module resolution
export {};
