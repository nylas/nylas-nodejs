// Cloudflare Workers Simplified Test Runner
// This runs a comprehensive set of tests in Cloudflare Workers nodejs_compat environment

// Import our built SDK (testing built files, not source files)
import nylas from '../lib/esm/nylas.js';

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

// Mock other globals that might be needed
global.Request = class Request {
  constructor(input, init) {
    this.url = input;
    this.method = init?.method || 'GET';
    this.headers = new Map(Object.entries(init?.headers || {}));
    this.body = init?.body;
  }
};

global.Response = class Response {
  constructor(body, init) {
    this.body = body;
    this.status = init?.status || 200;
    this.ok = this.status >= 200 && this.status < 300;
    this.headers = new Map(Object.entries(init?.headers || {}));
  }
};

global.Headers = class Headers {
  constructor(init) {
    this.map = new Map(Object.entries(init || {}));
  }
  
  get(name) {
    return this.map.get(name.toLowerCase());
  }
  
  set(name, value) {
    this.map.set(name.toLowerCase(), value);
  }
  
  has(name) {
    return this.map.has(name.toLowerCase());
  }
  
  raw() {
    const result = {};
    for (const [key, value] of this.map) {
      result[key] = [value];
    }
    return result;
  }
};

// Simple test framework for Cloudflare Workers
function test(name, fn) {
  return { name, fn };
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
    toBeDefined() {
      if (typeof value === 'undefined') {
        throw new Error(`Expected ${value} to be defined`);
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

// Run comprehensive test suite
function runComprehensiveTests() {
  const testResults = [];
  let totalPassed = 0;
  let totalFailed = 0;

  const tests = [
    // Test 1: Basic SDK functionality
    test('SDK Import: should import SDK successfully', () => {
      expect(nylas).toBeDefined();
      expect(typeof nylas).toBe('function');
    }),

    test('SDK Creation: should create client with minimal config', () => {
      const client = new nylas({ apiKey: 'test-key' });
      expect(client).toBeDefined();
      expect(client.apiClient).toBeDefined();
    }),

    test('SDK Creation: should handle optional types correctly', () => {
      expect(() => {
        new nylas({
          apiKey: 'test-key',
          // Optional properties should not cause errors
        });
      }).not.toThrow();
    }),

    test('SDK Resources: should have all required resources', () => {
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
    }),

    // Test 2: API Client functionality
    test('API Client: should create API client with config', () => {
      const client = new nylas({ apiKey: 'test-key' });
      expect(client.apiClient).toBeDefined();
      expect(client.apiClient.apiKey).toBe('test-key');
    }),

    // Test 3: Resource methods - Calendars
    test('Calendars Resource: should have all required methods', () => {
      const client = new nylas({ apiKey: 'test-key' });
      expect(typeof client.calendars.list).toBe('function');
      expect(typeof client.calendars.find).toBe('function');
      expect(typeof client.calendars.create).toBe('function');
      expect(typeof client.calendars.update).toBe('function');
      expect(typeof client.calendars.destroy).toBe('function');
    }),

    // Test 4: Resource methods - Events
    test('Events Resource: should have all required methods', () => {
      const client = new nylas({ apiKey: 'test-key' });
      expect(typeof client.events.list).toBe('function');
      expect(typeof client.events.find).toBe('function');
      expect(typeof client.events.create).toBe('function');
      expect(typeof client.events.update).toBe('function');
      expect(typeof client.events.destroy).toBe('function');
    }),

    // Test 5: Resource methods - Messages
    test('Messages Resource: should have all required methods', () => {
      const client = new nylas({ apiKey: 'test-key' });
      expect(typeof client.messages.list).toBe('function');
      expect(typeof client.messages.find).toBe('function');
      expect(typeof client.messages.send).toBe('function');
      expect(typeof client.messages.update).toBe('function');
      expect(typeof client.messages.destroy).toBe('function');
    }),

    // Test 6: TypeScript optional types (the main issue we're solving)
    test('Optional Types: should work with minimal configuration', () => {
      expect(() => {
        new nylas({ apiKey: 'test-key' });
      }).not.toThrow();
    }),

    test('Optional Types: should work with partial configuration', () => {
      expect(() => {
        new nylas({
          apiKey: 'test-key',
          apiUri: 'https://api.us.nylas.com'
        });
      }).not.toThrow();
    }),

    test('Optional Types: should work with all optional properties', () => {
      expect(() => {
        new nylas({
          apiKey: 'test-key',
          apiUri: 'https://api.us.nylas.com',
          timeout: 30000
        });
      }).not.toThrow();
    }),

    // Test 7: ESM compatibility
    test('ESM Compatibility: should work with ESM import', () => {
      const client = new nylas({ apiKey: 'test-key' });
      expect(client).toBeDefined();
    }),

    // Test 8: Configuration handling
    test('Configuration: should handle different API configurations', () => {
      const client1 = new nylas({ apiKey: 'key1' });
      const client2 = new nylas({ apiKey: 'key2', apiUri: 'https://api.eu.nylas.com' });
      const client3 = new nylas({ apiKey: 'key3', timeout: 5000 });

      expect(client1.apiClient.apiKey).toBe('key1');
      expect(client2.apiClient.apiKey).toBe('key2');
      expect(client3.apiClient.apiKey).toBe('key3');
    })
  ];

  // Run all tests
  for (const t of tests) {
    try {
      t.fn();
      testResults.push(`✅ ${t.name}`);
      totalPassed++;
    } catch (e) {
      testResults.push(`❌ ${t.name}: ${e.message}`);
      totalFailed++;
    }
  }

  const status = totalFailed === 0 ? 'PASS' : 'FAIL';
  const summary = `${totalPassed}/${tests.length} tests passed`;

  return {
    status,
    summary,
    environment: 'cloudflare-workers-nodejs-compat',
    passed: totalPassed,
    failed: totalFailed,
    total: tests.length,
    results: testResults,
  };
}

export default {
  fetch(request, env, ctx) {
    try {
      if (new URL(request.url).pathname === '/test') {
        const results = runComprehensiveTests();
        return new Response(JSON.stringify(results), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response('Nylas SDK Comprehensive Test Runner Worker. Access /test to execute tests.', { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({
        status: 'ERROR',
        summary: `Worker error: ${error.message}`,
        environment: 'cloudflare-workers-nodejs-compat',
        passed: 0,
        failed: 1,
        total: 1,
        results: [`❌ Worker Error: ${error.message}`],
        error: error.stack
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  },
};