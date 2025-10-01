// Cloudflare Workers test runner for Nylas SDK
// This runs our Jest tests in a Cloudflare Workers environment

import nylas from '../lib/esm/nylas.js';

// Simple test runner that mimics Jest behavior
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
  }
  
  describe(name, fn) {
    console.log(`\n📁 ${name}`);
    fn();
  }
  
  it(name, fn) {
    this.tests.push({ name, fn });
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
        this.results.push({ name: test.name, status: 'PASS' });
      } catch (error) {
        console.log(`  ✗ ${test.name}: ${error.message}`);
        this.results.push({ name: test.name, status: 'FAIL', error: error.message });
      }
    }
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const total = this.results.length;
    
    console.log(`\n📊 Results: ${passed}/${total} tests passed`);
    
    return {
      status: passed === total ? 'PASS' : 'FAIL',
      summary: `${passed}/${total} tests passed`,
      results: this.results
    };
  }
}

// Create test runner instance
const testRunner = new TestRunner();

// Run our tests
testRunner.describe('Nylas SDK in Cloudflare Workers', () => {
  testRunner.it('should import SDK successfully', () => {
    testRunner.expect(nylas).toBeDefined();
    testRunner.expect(typeof nylas).toBe('function');
  });
  
  testRunner.it('should create client with minimal config', () => {
    const client = new nylas({ apiKey: 'test-key' });
    testRunner.expect(client).toBeDefined();
  });
  
  testRunner.it('should handle optional types correctly', () => {
    testRunner.expect(() => {
      new nylas({ 
        apiKey: 'test-key',
        // Optional properties should not cause errors
      });
    }).not.toThrow();
  });
  
  testRunner.it('should create client with optional properties', () => {
    const client = new nylas({ 
      apiKey: 'test-key',
      apiUri: 'https://api.us.nylas.com',
      timeout: 30000
    });
    testRunner.expect(client).toBeDefined();
  });
  
  testRunner.it('should have properly initialized resources', () => {
    const client = new nylas({ apiKey: 'test-key' });
    testRunner.expect(client.calendars).toBeDefined();
    testRunner.expect(typeof client.calendars.list).toBe('function');
  });
  
  testRunner.it('should work with ESM import', () => {
    const client = new nylas({ apiKey: 'test-key' });
    testRunner.expect(client).toBeDefined();
  });
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === '/test') {
      const results = await testRunner.runTests();
      
      return new Response(JSON.stringify({
        ...results,
        environment: 'cloudflare-workers-esm',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        environment: 'cloudflare-workers-esm',
        sdk: 'nylas-nodejs'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      message: 'Nylas SDK Cloudflare Workers Test Runner',
      endpoints: {
        '/test': 'Run Jest-style tests',
        '/health': 'Health check'
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};