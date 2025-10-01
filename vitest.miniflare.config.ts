import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setupMiniflareTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'cobertura'],
      thresholds: {
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    // Environment variables for Cloudflare Workers testing
    env: {
      CLOUDFLARE_WORKERS: 'true',
    },
  },
  resolve: {
    alias: {
      '^[../]+src/([^/]+)$': '<rootDir>/src/$1.ts',
      '^[../]+src/resources/([^/]+)$': '<rootDir>/src/resources/$1.ts',
      '^[../]+src/models/([^/]+)$': '<rootDir>/src/models/$1.ts',
      // Handle .js imports in TypeScript files for Vitest
      '^(.+)\\.js$': '$1',
    },
  },
  esbuild: {
    target: 'node16',
  },
});