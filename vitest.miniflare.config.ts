import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    globals: true,
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
    poolOptions: {
      workers: {
        miniflare: {
          // Miniflare configuration for Cloudflare Workers environment
          compatibilityDate: '2023-05-18',
          compatibilityFlags: ['nodejs_compat'],
          // Enable Node.js compatibility for SDK dependencies
          bindings: {},
        },
      },
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
  // Configure Vite to handle CommonJS modules properly
  optimizeDeps: {
    include: ['mime-types', 'mime-db'],
  },
  // Bundle Node.js dependencies for Workers environment
  ssr: {
    external: [],
    noExternal: [
      'node-fetch',
      'mime-types',
      'mime-db',
      'form-data-encoder',
      'formdata-node',
    ],
    optimizeDeps: {
      include: ['mime-types', 'mime-db'],
    },
  },
});
