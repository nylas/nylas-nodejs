// Cloudflare Workers Comprehensive Test Runner
// This runs comprehensive tests in Cloudflare Workers nodejs_compat environment
// Note: We can't import actual Jest test files due to Jest syntax incompatibility
// Instead, we run focused tests that validate the SDK works in Cloudflare Workers

// Import our built SDK (testing built files, not source files)
import nylas from '../lib/esm/nylas.js';

// Simple test framework for Cloudflare Workers
const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function expect(value) {
  return {
    toBe(expected) {
      if (value !== expected) {
        throw new Error(`Expected ${value} to be ${expected}`);
      }
    },
    toBeTruthy() {
      if (!value) {
        throw new Error(`Expected ${value} to be truthy`);
      }
    },
    toBeInstanceOf(expectedClass) {
      if (!(value instanceof expectedClass)) {
        throw new Error(`Expected ${value} to be an instance of ${expectedClass.name}`);
      }
    },
    toBeDefined() {
      if (typeof value === 'undefined') {
        throw new Error(`Expected ${value} to be defined`);
      }
    },
    toHaveProperty(prop) {
      if (!Object.prototype.hasOwnProperty.call(value, prop)) {
        throw new Error(`Expected object to have property ${prop}`);
      }
    },
    toBeFunction() {
      if (typeof value !== 'function') {
        throw new Error(`Expected ${value} to be a function`);
      }
    },
    not: {
      toThrow() {
        try {
          value();
        } catch (e) {
          throw new Error(`Expected function not to throw, but it threw: ${e.message}`);
        }
      }
    }
  };
}

// Mock fetch for Cloudflare Workers environment
global.fetch = async (input, init) => {
  if (input.includes('/health')) {
    return new Response(JSON.stringify({ status: 'healthy' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ id: 'mock_id', status: 'success' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

// Run our comprehensive test suite
async function runTests() {
  console.log('🧪 Running comprehensive tests in Cloudflare Workers...\n');
  
  // Test 1: Basic SDK functionality
  test('Nylas SDK in Cloudflare Workers: should import SDK successfully', () => {
    expect(nylas).toBeDefined();
    expect(typeof nylas).toBe('function');
  });
  
  test('Nylas SDK in Cloudflare Workers: should create client with minimal config', () => {
    const client = new nylas({ apiKey: 'test-key' });
    expect(client).toBeDefined();
    expect(client.apiClient).toBeDefined();
  });
  
  test('Nylas SDK in Cloudflare Workers: should handle optional types correctly', () => {
    expect(() => {
      new nylas({ 
        apiKey: 'test-key',
        // Optional properties should not cause errors
      });
    }).not.toThrow();
  });
  
  test('Nylas SDK in Cloudflare Workers: should create client with all optional properties', () => {
    const client = new nylas({ 
      apiKey: 'test-key',
      apiUri: 'https://api.us.nylas.com',
      timeout: 30000
    });
    expect(client).toBeDefined();
    expect(client.apiClient).toBeDefined();
  });
  
  test('Nylas SDK in Cloudflare Workers: should have properly initialized resources', () => {
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
  
  test('Nylas SDK in Cloudflare Workers: should work with ESM import', () => {
    const client = new nylas({ apiKey: 'test-key' });
    expect(client).toBeDefined();
  });
  
  // Test 2: API Client functionality
  test('API Client in Cloudflare Workers: should create API client with config', () => {
    const client = new nylas({ apiKey: 'test-key' });
    expect(client.apiClient).toBeDefined();
    expect(client.apiClient.apiKey).toBe('test-key');
  });
  
  test('API Client in Cloudflare Workers: should handle different API URIs', () => {
    const client = new nylas({ 
      apiKey: 'test-key',
      apiUri: 'https://api.eu.nylas.com'
    });
    expect(client.apiClient).toBeDefined();
  });
  
  // Test 3: Resource methods
  test('Resource methods in Cloudflare Workers: should have calendars resource methods', () => {
    const client = new nylas({ apiKey: 'test-key' });
    expect(typeof client.calendars.list).toBe('function');
    expect(typeof client.calendars.find).toBe('function');
    expect(typeof client.calendars.create).toBe('function');
    expect(typeof client.calendars.update).toBe('function');
    expect(typeof client.calendars.destroy).toBe('function');
  });
  
  test('Resource methods in Cloudflare Workers: should have events resource methods', () => {
    const client = new nylas({ apiKey: 'test-key' });
    expect(typeof client.events.list).toBe('function');
    expect(typeof client.events.find).toBe('function');
    expect(typeof client.events.create).toBe('function');
    expect(typeof client.events.update).toBe('function');
    expect(typeof client.events.destroy).toBe('function');
  });
  
  test('Resource methods in Cloudflare Workers: should have messages resource methods', () => {
    const client = new nylas({ apiKey: 'test-key' });
    expect(typeof client.messages.list).toBe('function');
    expect(typeof client.messages.find).toBe('function');
    expect(typeof client.messages.create).toBe('function');
    expect(typeof client.messages.update).toBe('function');
    expect(typeof client.messages.destroy).toBe('function');
  });
  
  // Test 4: TypeScript optional types (the main issue we're solving)
  test('TypeScript Optional Types in Cloudflare Workers: should work with minimal configuration', () => {
    expect(() => {
      new nylas({ apiKey: 'test-key' });
    }).not.toThrow();
  });
  
  test('TypeScript Optional Types in Cloudflare Workers: should work with partial configuration', () => {
    expect(() => {
      new nylas({ 
        apiKey: 'test-key',
        apiUri: 'https://api.us.nylas.com'
      });
    }).not.toThrow();
  });
  
  test('TypeScript Optional Types in Cloudflare Workers: should work with all optional properties', () => {
    expect(() => {
      new nylas({ 
        apiKey: 'test-key',
        apiUri: 'https://api.us.nylas.com',
        timeout: 30000
      });
    }).not.toThrow();
  });
  
  // Test 5: Additional comprehensive tests
  test('Additional Cloudflare Workers Tests: should handle different API configurations', () => {
    const client1 = new nylas({ apiKey: 'key1' });
    const client2 = new nylas({ apiKey: 'key2', apiUri: 'https://api.eu.nylas.com' });
    const client3 = new nylas({ apiKey: 'key3', timeout: 5000 });
    
    expect(client1.apiKey).toBe('key1');
    expect(client2.apiKey).toBe('key2');
    expect(client3.apiKey).toBe('key3');
  });
  
  test('Additional Cloudflare Workers Tests: should have all required resources', () => {
    const client = new nylas({ apiKey: 'test-key' });
    
    // Test all resources exist
    const resources = [
      'calendars', 'events', 'messages', 'contacts', 'attachments',
      'webhooks', 'auth', 'grants', 'applications', 'drafts',
      'threads', 'folders', 'scheduler', 'notetakers'
    ];
    
    resources.forEach(resource => {
      expect(client[resource]).toBeDefined();
      expect(typeof client[resource]).toBe('object');
    });
  });
  
  test('Additional Cloudflare Workers Tests: should handle resource method calls', () => {
    const client = new nylas({ apiKey: 'test-key' });
    
    // Test that resource methods are callable
    expect(() => {
      client.calendars.list({ identifier: 'test' });
    }).not.toThrow();
    
    expect(() => {
      client.events.list({ identifier: 'test' });
    }).not.toThrow();
    
    expect(() => {
      client.messages.list({ identifier: 'test' });
    }).not.toThrow();
  });
  
  // Run all tests
  const results = [];
  for (const { name, fn } of tests) {
    try {
      fn();
      passed++;
      results.push(`✅ ${name}`);
    } catch (error) {
      failed++;
      results.push(`❌ ${name}: ${error.message}`);
    }
  }
  
  return {
    passed,
    failed,
    total: passed + failed,
    results
  };
}

// Export the worker
export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/test') {
      try {
        const testResults = await runTests();
        
        const status = testResults.failed === 0 ? 'PASS' : 'FAIL';
        const summary = `${testResults.passed}/${testResults.total} tests passed`;
        
        return new Response(
          JSON.stringify(
            {
              status,
              summary,
              environment: 'cloudflare-workers-nodejs-compat',
              passed: testResults.passed,
              failed: testResults.failed,
              total: testResults.total,
              results: testResults.results,
            },
            null,
            2
          ),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify(
            {
              status: 'ERROR',
              summary: 'Test runner failed',
              environment: 'cloudflare-workers-nodejs-compat',
              error: error.message,
            },
            null,
            2
          ),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
    }
    
    return new Response('Nylas SDK Test Runner Worker. Access /test to run tests.', { status: 200 });
  },
};