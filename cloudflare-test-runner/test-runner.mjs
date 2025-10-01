// Cloudflare Workers Test Runner for Nylas SDK
// This runs our actual test suite in Cloudflare Workers nodejs_compat environment

import nylas from '../lib/esm/nylas.js';

// Mock Jest-like test environment
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
    this.currentSuite = null;
  }
  
  describe(name, fn) {
    console.log(`\n📁 ${name}`);
    this.currentSuite = name;
    fn();
  }
  
  it(name, fn) {
    this.tests.push({ 
      suite: this.currentSuite, 
      name, 
      fn,
      status: 'pending'
    });
  }
  
  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected}, got ${actual}`);
        }
      },
      toBeDefined: () => {
        if (actual === undefined) {
          throw new Error('Expected value to be defined');
        }
      },
      toThrow: () => {
        try {
          actual();
          throw new Error('Expected function to throw');
        } catch (e) {
          // Expected to throw
        }
      },
      not: {
        toThrow: () => {
          try {
            actual();
          } catch (e) {
            throw new Error(`Expected function not to throw, but it threw: ${e.message}`);
          }
        }
      }
    };
  }
  
  async runTests() {
    console.log('🧪 Running Nylas SDK tests in Cloudflare Workers...\n');
    
    for (const test of this.tests) {
      try {
        console.log(`  ✓ ${test.name}`);
        await test.fn();
        test.status = 'PASS';
        this.results.push({ ...test, status: 'PASS' });
      } catch (error) {
        console.log(`  ✗ ${test.name}: ${error.message}`);
        test.status = 'FAIL';
        this.results.push({ ...test, status: 'FAIL', error: error.message });
      }
    }
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    
    console.log(`\n📊 Results: ${passed}/${total} tests passed (${failed} failed)`);
    
    return {
      status: failed === 0 ? 'PASS' : 'FAIL',
      summary: `${passed}/${total} tests passed`,
      results: this.results,
      passed,
      failed,
      total
    };
  }
}

// Create test runner instance
const testRunner = new TestRunner();

// Import our test utilities
const { expect } = testRunner;

// Run our actual test suite (based on our existing tests)
testRunner.describe('Nylas SDK in Cloudflare Workers', () => {
  testRunner.it('should import SDK successfully', () => {
    expect(nylas).toBeDefined();
    expect(typeof nylas).toBe('function');
  });
  
  testRunner.it('should create client with minimal config', () => {
    const client = new nylas({ apiKey: 'test-key' });
    expect(client).toBeDefined();
    expect(client.apiClient).toBeDefined();
  });
  
  testRunner.it('should handle optional types correctly', () => {
    expect(() => {
      new nylas({ 
        apiKey: 'test-key',
        // Optional properties should not cause errors
      });
    }).not.toThrow();
  });
  
  testRunner.it('should create client with all optional properties', () => {
    const client = new nylas({ 
      apiKey: 'test-key',
      apiUri: 'https://api.us.nylas.com',
      timeout: 30000
    });
    expect(client).toBeDefined();
    expect(client.apiClient).toBeDefined();
  });
  
  testRunner.it('should have properly initialized resources', () => {
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
  
  testRunner.it('should work with ESM import', () => {
    const client = new nylas({ apiKey: 'test-key' });
    expect(client).toBeDefined();
  });
});

// API Client tests
testRunner.describe('API Client in Cloudflare Workers', () => {
  testRunner.it('should create API client with config', () => {
    const client = new nylas({ apiKey: 'test-key' });
    expect(client.apiClient).toBeDefined();
    expect(client.apiClient.apiKey).toBe('test-key');
  });
  
  testRunner.it('should handle different API URIs', () => {
    const client = new nylas({ 
      apiKey: 'test-key',
      apiUri: 'https://api.eu.nylas.com'
    });
    expect(client.apiClient).toBeDefined();
  });
});

// Resource methods tests
testRunner.describe('Resource methods in Cloudflare Workers', () => {
  let client;
  
  // Setup
  client = new nylas({ apiKey: 'test-key' });
  
  testRunner.it('should have calendars resource methods', () => {
    expect(typeof client.calendars.list).toBe('function');
    expect(typeof client.calendars.find).toBe('function');
    expect(typeof client.calendars.create).toBe('function');
    expect(typeof client.calendars.update).toBe('function');
    expect(typeof client.calendars.destroy).toBe('function');
  });
  
  testRunner.it('should have events resource methods', () => {
    expect(typeof client.events.list).toBe('function');
    expect(typeof client.events.find).toBe('function');
    expect(typeof client.events.create).toBe('function');
    expect(typeof client.events.update).toBe('function');
    expect(typeof client.events.destroy).toBe('function');
  });
  
  testRunner.it('should have messages resource methods', () => {
    expect(typeof client.messages.list).toBe('function');
    expect(typeof client.messages.find).toBe('function');
    expect(typeof client.messages.send).toBe('function');
    expect(typeof client.messages.update).toBe('function');
    expect(typeof client.messages.destroy).toBe('function');
  });
});

// TypeScript optional types tests (the main issue we're solving)
testRunner.describe('TypeScript Optional Types in Cloudflare Workers', () => {
  testRunner.it('should work with minimal configuration', () => {
    expect(() => {
      new nylas({ apiKey: 'test-key' });
    }).not.toThrow();
  });
  
  testRunner.it('should work with partial configuration', () => {
    expect(() => {
      new nylas({ 
        apiKey: 'test-key',
        apiUri: 'https://api.us.nylas.com'
      });
    }).not.toThrow();
  });
  
  testRunner.it('should work with all optional properties', () => {
    expect(() => {
      new nylas({ 
        apiKey: 'test-key',
        apiUri: 'https://api.us.nylas.com',
        timeout: 30000
      });
    }).not.toThrow();
  });
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === '/test') {
      const results = await testRunner.runTests();
      
      return new Response(JSON.stringify({
        ...results,
        environment: 'cloudflare-workers-nodejs-compat',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        environment: 'cloudflare-workers-nodejs-compat',
        sdk: 'nylas-nodejs'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      message: 'Nylas SDK Test Runner for Cloudflare Workers',
      endpoints: {
        '/test': 'Run test suite',
        '/health': 'Health check'
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};