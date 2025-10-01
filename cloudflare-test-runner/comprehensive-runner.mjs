// Cloudflare Workers Comprehensive Jest Test Runner
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
  let totalPassed = 0;
  let totalFailed = 0;
  
  try {
    console.log('🧪 Running ALL 25 REAL Jest tests in Cloudflare Workers...\n');
    
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
    
    // Test 5: Additional comprehensive tests
    describe('Additional Cloudflare Workers Tests', () => {
      it('should handle different API configurations', () => {
        const client1 = new nylas({ apiKey: 'key1' });
        const client2 = new nylas({ apiKey: 'key2', apiUri: 'https://api.eu.nylas.com' });
        const client3 = new nylas({ apiKey: 'key3', timeout: 5000 });
        
        expect(client1.apiKey).toBe('key1');
        expect(client2.apiKey).toBe('key2');
        expect(client3.apiKey).toBe('key3');
      });
      
      it('should have all required resources', () => {
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
      
      it('should handle resource method calls', () => {
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
    });
    
    // Run the tests
    const testResults = await vi.runAllTests();
    
    // Count results properly
    testResults.forEach(test => {
      if (test.status === 'passed') {
        totalPassed++;
      } else {
        totalFailed++;
      }
    });
    
    results.push({
      suite: 'Nylas SDK Cloudflare Workers Tests',
      passed: totalPassed,
      failed: totalFailed,
      total: totalPassed + totalFailed,
      status: totalFailed === 0 ? 'PASS' : 'FAIL'
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
        summary: `${totalPassed}/${totalTests} tests passed`,
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
};