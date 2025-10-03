import { vi } from 'vitest';

// Mock fetch globally for Vitest
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

// Mock Request constructor with headers that have raw() method
global.Request = class MockRequest {
  url: string;
  method: string;
  headers: any;
  body: any;
  bodyUsed: boolean;

  constructor(url: string | URL, options?: any) {
    // Convert URL object to string if needed
    this.url = typeof url === 'string' ? url : url.toString();
    this.method = options?.method || 'GET';
    this.body = options?.body || null;
    this.bodyUsed = false;

    const headers = new Map();
    if (options?.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.set(key, value as string);
      });
    }

    // Add raw() method to headers
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    (headers as any).raw = () => {
      const rawHeaders: Record<string, string[]> = {};
      headers.forEach((value, key) => {
        rawHeaders[key] = [value];
      });
      return rawHeaders;
    };

    this.headers = headers;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  clone() {
    return this;
  }
} as any;

// Export for TypeScript module resolution
export {};
