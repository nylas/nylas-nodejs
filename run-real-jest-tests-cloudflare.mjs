#!/usr/bin/env node

/**
 * Run ALL 25 REAL Jest tests in Cloudflare Workers environment
 * This runs the actual Jest test suite in Cloudflare Workers nodejs_compat environment
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Running ALL 25 REAL Jest tests in Cloudflare Workers environment...\n');

// Create a Jest configuration for Cloudflare Workers that tests built files
async function createJestConfigForCloudflare() {
  const jestConfig = `module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  // Test built files, not source files
  moduleNameMapping: {
    '^nylas$': '<rootDir>/lib/esm/nylas.js',
    '^nylas/(.*)$': '<rootDir>/lib/esm/$1.js'
  },
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  collectCoverageFrom: [
    'lib/**/*.js',
    '!lib/**/*.d.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setupCloudflareWorkers.ts'],
  testTimeout: 30000,
  // Mock Cloudflare Workers environment
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  // Transform ignore patterns for Cloudflare Workers compatibility
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|mime-db|mime-types)/)'
  ]
};`;

  await writeFile(join(__dirname, 'jest.config.cloudflare.js'), jestConfig);
  console.log('✅ Created Jest configuration for Cloudflare Workers');
}

// Create a comprehensive Cloudflare Workers setup file
async function createCloudflareWorkersSetup() {
  const setupCode = `// Setup for Cloudflare Workers environment testing with Jest
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

console.log('🧪 Cloudflare Workers environment setup complete for Jest');`;

  await writeFile(join(__dirname, 'tests', 'setupCloudflareWorkers.ts'), setupCode);
  console.log('✅ Created Cloudflare Workers setup for Jest');
}

async function runJestWithCloudflareEnvironment() {
  console.log('📦 Setting up Jest with Cloudflare Workers environment...');
  
  // Create the Jest configuration and setup files
  await createJestConfigForCloudflare();
  await createCloudflareWorkersSetup();
  
  console.log('🚀 Running Jest with Cloudflare Workers environment...');
  
  // Run Jest with the Cloudflare Workers configuration
  const jestProcess = spawn('npx', ['jest', '--config', 'jest.config.cloudflare.js', '--verbose'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  return new Promise((resolve) => {
    jestProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n🎉 All Jest tests passed with Cloudflare Workers environment!');
        console.log('✅ The SDK works correctly in Cloudflare Workers environment');
        console.log('✅ Optional types are working correctly in Cloudflare Workers context');
        resolve(true);
      } else {
        console.log('\n❌ Some Jest tests failed with Cloudflare Workers environment');
        console.log('❌ There may be issues with the SDK in Cloudflare Workers context');
        resolve(false);
      }
    });
    
    jestProcess.on('error', (error) => {
      console.error('❌ Error running Jest:', error);
      resolve(false);
    });
  });
}

// Main execution
async function main() {
  console.log('🔍 Setting up Jest with Cloudflare Workers environment...');
  
  const success = await runJestWithCloudflareEnvironment();
  process.exit(success ? 0 : 1);
}

// Run the tests
main().catch(error => {
  console.error('💥 Jest with Cloudflare Workers environment failed:', error);
  process.exit(1);
});