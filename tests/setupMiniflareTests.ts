import { vi } from 'vitest';

// Mock fetch globally for Vitest
global.fetch = vi.fn();

// Cloudflare Workers environment setup
// This simulates the Cloudflare Workers environment for testing
if (process.env.CLOUDFLARE_WORKERS === 'true') {
  // Set up Cloudflare Workers globals
  globalThis.CloudflareWorkers = true;
  
  // Mock Cloudflare Workers specific APIs if needed
  // globalThis.caches = new Map();
  // globalThis.crypto = require('crypto');
}

// Export for TypeScript module resolution
export {};