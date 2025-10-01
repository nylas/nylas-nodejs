// Setup for Cloudflare Workers environment testing with Jest
// This simulates the Cloudflare Workers nodejs_compat environment

// Mock Cloudflare Workers globals
global.fetch = require('node-fetch');
global.Request = require('node-fetch').Request;
global.Response = require('node-fetch').Response;
global.Headers = require('node-fetch').Headers;

// Mock other Cloudflare Workers specific globals
global.crypto = require('crypto').webcrypto;
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Set up test environment for Cloudflare Workers
jest.setTimeout(30000);

// Mock process for Cloudflare Workers
Object.defineProperty(global, 'process', {
  value: {
    ...process,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      CLOUDFLARE_WORKER: 'true'
    }
  }
});

// Mock console for Cloudflare Workers
const originalConsole = console;
global.console = {
  ...originalConsole,
  // Cloudflare Workers might have different console behavior
  log: (...args) => originalConsole.log('[CF Worker]', ...args),
  error: (...args) => originalConsole.error('[CF Worker]', ...args),
  warn: (...args) => originalConsole.warn('[CF Worker]', ...args),
  info: (...args) => originalConsole.info('[CF Worker]', ...args),
};

console.log('🧪 Cloudflare Workers environment setup complete for Jest');