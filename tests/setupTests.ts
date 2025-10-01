import { vi } from 'vitest';

// Mock fetch globally for Vitest
global.fetch = vi.fn();

// Mock fetch with proper response structure
global.fetch.mockResolvedValue({
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

// Export for TypeScript module resolution
export {};
