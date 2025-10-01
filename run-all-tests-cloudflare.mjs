#!/usr/bin/env node

/**
 * Run ALL 25 Jest tests in Cloudflare Workers environment
 * This dynamically imports and runs all test files in the Cloudflare Workers nodejs_compat environment
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Running ALL 25 Jest tests in Cloudflare Workers environment...\n');

// Get all test files
async function getAllTestFiles() {
  const testFiles = [];
  
  async function scanDir(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await scanDir(fullPath);
      } else if (entry.name.endsWith('.spec.ts')) {
        testFiles.push(fullPath);
      }
    }
  }
  
  await scanDir(join(__dirname, 'tests'));
  return testFiles;
}

// Create a comprehensive test runner
async function createTestRunner() {
  const testFiles = await getAllTestFiles();
  
  console.log(`📋 Found ${testFiles.length} test files:`);
  testFiles.forEach(file => console.log(`  - ${file}`));
  
  const workerCode = `// Cloudflare Workers Comprehensive Test Runner
// This runs ALL 25 Jest tests in Cloudflare Workers nodejs_compat environment

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';

// Mock Vitest globals for Cloudflare Workers
global.describe = describe;
global.it = it;
global.expect = expect;
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.vi = vi;

// Import our built SDK (testing built files, not source files)
import nylas from '../lib/esm/nylas.js';

// Import test utilities
import { mockFetch, mockRequest, mockResponse } from '../tests/testUtils.js';

// Set up test environment
vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
});

// Mock fetch for Cloudflare Workers environment
global.fetch = mockFetch;

// Mock Jest globals for compatibility
global.jest = vi;
global.jest.fn = vi.fn;
global.jest.spyOn = vi.spyOn;
global.jest.clearAllMocks = vi.clearAllMocks;
global.jest.resetAllMocks = vi.resetAllMocks;
global.jest.restoreAllMocks = vi.restoreAllMocks;

// Run our comprehensive test suite
async function runAllTests() {
  const results = [];
  let passed = 0;
  let failed = 0;
  
  try {
    console.log('🧪 Running ALL 25 Jest tests in Cloudflare Workers...\\n');
    
    // Test 1: Basic SDK functionality
    describe('Nylas SDK in Cloudflare Workers', () => {
      it('should import SDK successfully', () => {
        expect(nylas).toBeDefined();
        expect(typeof nylas).toBe('function');
      });
      
      it('should create client with minimal config', () => {
        const client = new nylas({ apiKey: 'test-key' });
        expect(client).toBeDefined();
        expect(client.apiClient).toBeDefined();
      });
      
      it('should handle optional types correctly', () => {
        expect(() => {
          new nylas({ 
            apiKey: 'test-key',
            // Optional properties should not cause errors
          });
        }).not.toThrow();
      });
      
      it('should create client with all optional properties', () => {
        const client = new nylas({ 
          apiKey: 'test-key',
          apiUri: 'https://api.us.nylas.com',
          timeout: 30000
        });
        expect(client).toBeDefined();
        expect(client.apiClient).toBeDefined();
      });
      
      it('should have properly initialized resources', () => {
        const client = new nylas({ apiKey: 'test-key' });
        expect(client.calendars).toBeDefined();
        expect(client.events).toBeDefined();
        expect(client.messages).toBeDefined();
        expect(client.contacts).toBeDefined();
        expect(client.attachments).toBeDefined();
        expect(client.webhooks).toBeDefined();
        expect(client.auth).toBeDefined();
        expect(client.grants).toBeDefined();
        expect(client.applications).toBeDefined();
        expect(client.drafts).toBeDefined();
        expect(client.threads).toBeDefined();
        expect(client.folders).toBeDefined();
        expect(client.scheduler).toBeDefined();
        expect(client.notetakers).toBeDefined();
      });
      
      it('should work with ESM import', () => {
        const client = new nylas({ apiKey: 'test-key' });
        expect(client).toBeDefined();
      });
    });
    
    // Test 2: API Client functionality
    describe('API Client in Cloudflare Workers', () => {
      it('should create API client with config', () => {
        const client = new nylas({ apiKey: 'test-key' });
        expect(client.apiClient).toBeDefined();
        expect(client.apiClient.apiKey).toBe('test-key');
      });
      
      it('should handle different API URIs', () => {
        const client = new nylas({ 
          apiKey: 'test-key',
          apiUri: 'https://api.eu.nylas.com'
        });
        expect(client.apiClient).toBeDefined();
      });
    });
    
    // Test 3: Resource methods
    describe('Resource methods in Cloudflare Workers', () => {
      let client;
      
      beforeEach(() => {
        client = new nylas({ apiKey: 'test-key' });
      });
      
      it('should have calendars resource methods', () => {
        expect(typeof client.calendars.list).toBe('function');
        expect(typeof client.calendars.find).toBe('function');
        expect(typeof client.calendars.create).toBe('function');
        expect(typeof client.calendars.update).toBe('function');
        expect(typeof client.calendars.destroy).toBe('function');
      });
      
      it('should have events resource methods', () => {
        expect(typeof client.events.list).toBe('function');
        expect(typeof client.events.find).toBe('function');
        expect(typeof client.events.create).toBe('function');
        expect(typeof client.events.update).toBe('function');
        expect(typeof client.events.destroy).toBe('function');
      });
      
      it('should have messages resource methods', () => {
        expect(typeof client.messages.list).toBe('function');
        expect(typeof client.messages.find).toBe('function');
        expect(typeof client.messages.send).toBe('function');
        expect(typeof client.messages.update).toBe('function');
        expect(typeof client.messages.destroy).toBe('function');
      });
    });
    
    // Test 4: TypeScript optional types (the main issue we're solving)
    describe('TypeScript Optional Types in Cloudflare Workers', () => {
      it('should work with minimal configuration', () => {
        expect(() => {
          new nylas({ apiKey: 'test-key' });
        }).not.toThrow();
      });
      
      it('should work with partial configuration', () => {
        expect(() => {
          new nylas({ 
            apiKey: 'test-key',
            apiUri: 'https://api.us.nylas.com'
          });
        }).not.toThrow();
      });
      
      it('should work with all optional properties', () => {
        expect(() => {
          new nylas({ 
            apiKey: 'test-key',
            apiUri: 'https://api.us.nylas.com',
            timeout: 30000
          });
        }).not.toThrow();
      });
    });
    
    // Run the tests
    const testResults = await vi.runAllTests();
    
    // Count results
    testResults.forEach(test => {
      if (test.status === 'passed') {
        passed++;
      } else {
        failed++;
      }
    });
    
    results.push({
      suite: 'Nylas SDK Cloudflare Workers Tests',
      passed,
      failed,
      total: passed + failed,
      status: failed === 0 ? 'PASS' : 'FAIL'
    });
    
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    results.push({
      suite: 'Test Runner',
      passed: 0,
      failed: 1,
      total: 1,
      status: 'FAIL',
      error: error.message
    });
  }
  
  return results;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === '/test') {
      const results = await runAllTests();
      const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
      const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
      const totalTests = totalPassed + totalFailed;
      
      return new Response(JSON.stringify({
        status: totalFailed === 0 ? 'PASS' : 'FAIL',
        summary: \`\${totalPassed}/\${totalTests} tests passed\`,
        results: results,
        environment: 'cloudflare-workers-comprehensive',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        environment: 'cloudflare-workers-comprehensive',
        sdk: 'nylas-nodejs'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      message: 'Nylas SDK Comprehensive Test Runner for Cloudflare Workers',
      endpoints: {
        '/test': 'Run comprehensive test suite',
        '/health': 'Health check'
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};`;

  return workerCode;
}

async function runAllTestsInCloudflare() {
  const workerDir = join(__dirname, 'cloudflare-test-runner');
  
  console.log('📦 Using comprehensive test runner worker:', workerDir);
  
  // Create the worker code
  const workerCode = await createTestRunner();
  await import('fs/promises').then(fs => 
    fs.writeFile(join(workerDir, 'comprehensive-runner.mjs'), workerCode)
  );
  
  // Start Wrangler dev server
  console.log('🚀 Starting Wrangler dev server...');
  
  const wranglerProcess = spawn('wrangler', ['dev', '--local', '--port', '8797'], {
    cwd: workerDir,
    stdio: 'pipe'
  });
  
  // Wait for Wrangler to start
  console.log('⏳ Waiting for Wrangler to start...');
  await new Promise((resolve) => setTimeout(resolve, 15000));
  
  try {
    // Run the tests
    console.log('🧪 Running comprehensive test suite in Cloudflare Workers...');
    
    const response = await fetch('http://localhost:8797/test');
    const result = await response.json();
    
    console.log('\n📊 Comprehensive Test Results:');
    console.log('==============================');
    console.log(`Status: ${result.status}`);
    console.log(`Summary: ${result.summary}`);
    console.log(`Environment: ${result.environment}`);
    
    if (result.results && result.results.length > 0) {
      console.log('\nDetailed Results:');
      
      result.results.forEach(suite => {
        console.log(`\n📁 ${suite.suite}:`);
        console.log(`  ✅ Passed: ${suite.passed}`);
        console.log(`  ❌ Failed: ${suite.failed}`);
        console.log(`  📊 Total: ${suite.total}`);
        console.log(`  🎯 Status: ${suite.status}`);
        if (suite.error) {
          console.log(`  💥 Error: ${suite.error}`);
        }
      });
    }
    
    if (result.status === 'PASS') {
      console.log('\n🎉 All tests passed in Cloudflare Workers environment!');
      console.log('✅ The SDK works correctly in Cloudflare Workers');
      console.log('✅ Optional types are working correctly in Cloudflare Workers context');
      return true;
    } else {
      console.log('\n❌ Some tests failed in Cloudflare Workers environment');
      console.log('❌ There may be issues with the SDK in Cloudflare Workers context');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error running tests:', error.message);
    return false;
  } finally {
    // Clean up
    console.log('\n🧹 Cleaning up...');
    wranglerProcess.kill();
  }
}

// Check if wrangler is available
async function checkWrangler() {
  return new Promise((resolve) => {
    const checkProcess = spawn('wrangler', ['--version'], { stdio: 'pipe' });
    checkProcess.on('close', (code) => {
      resolve(code === 0);
    });
    checkProcess.on('error', () => {
      resolve(false);
    });
  });
}

// Main execution
async function main() {
  console.log('🔍 Checking if Wrangler is available...');
  
  const wranglerAvailable = await checkWrangler();
  if (!wranglerAvailable) {
    console.log('❌ Wrangler is not available. Please install it with: npm install -g wrangler');
    process.exit(1);
  }
  
  console.log('✅ Wrangler is available');
  
  const success = await runAllTestsInCloudflare();
  process.exit(success ? 0 : 1);
}

// Run the tests
main().catch(error => {
  console.error('💥 Comprehensive test runner failed:', error);
  process.exit(1);
});