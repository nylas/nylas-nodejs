import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Test only built files, not source files
    include: ['tests/**/*.spec.ts'],
    // Mock Cloudflare Workers environment
    setupFiles: ['tests/setupCloudflareWorkers.ts'],
    // Use ESM for better Cloudflare Workers compatibility
    pool: 'forks',
    // Map imports to built files
    alias: {
      'nylas': resolve(__dirname, 'lib/esm/nylas.js'),
      'nylas/(.*)': resolve(__dirname, 'lib/esm/$1.js'),
    },
    // Handle ESM modules
    deps: {
      external: ['node-fetch']
    },
    // Mock fetch for Cloudflare Workers environment
    environmentOptions: {
      jsdom: {
        resources: 'usable'
      }
    }
  },
  resolve: {
    alias: {
      'nylas': resolve(__dirname, 'lib/esm/nylas.js'),
      'nylas/(.*)': resolve(__dirname, 'lib/esm/$1.js'),
    }
  }
});