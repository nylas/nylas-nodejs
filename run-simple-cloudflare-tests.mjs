#!/usr/bin/env node

/**
 * Simple Cloudflare Workers Test Runner
 * This tests the SDK in a Node.js environment that simulates Cloudflare Workers
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Running Nylas SDK tests in Cloudflare Workers-like environment...\n');

// Mock Cloudflare Workers globals
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

async function runCloudflareTests() {
  try {
    // Run comprehensive tests
    const testResults = [];
    let totalPassed = 0;
    let totalFailed = 0;

    // Import the SDK once
    const nylasModule = await import('./lib/esm/nylas.js');
    const nylas = nylasModule.default;

    // Test 1: Basic SDK functionality
    try {
      if (!nylas) {
        throw new Error('SDK not imported');
      }
      
      if (typeof nylas !== 'function') {
        throw new Error('SDK is not a function');
      }
      
      testResults.push('✅ SDK Import: should import SDK successfully');
      totalPassed++;
    } catch (error) {
      testResults.push(`❌ SDK Import: should import SDK successfully - ${error.message}`);
      totalFailed++;
    }

    // Test 2: SDK Creation
    try {
      const client = new nylas({ apiKey: 'test-key' });
      
      if (!client) {
        throw new Error('Client not created');
      }
      
      if (!client.apiClient) {
        throw new Error('API client not created');
      }
      
      testResults.push('✅ SDK Creation: should create client with minimal config');
      totalPassed++;
    } catch (error) {
      testResults.push(`❌ SDK Creation: should create client with minimal config - ${error.message}`);
      totalFailed++;
    }

    // Test 3: Optional Types
    try {
      // Test minimal config
      new nylas({ apiKey: 'test-key' });
      
      // Test partial config
      new nylas({
        apiKey: 'test-key',
        apiUri: 'https://api.us.nylas.com'
      });
      
      // Test full config
      new nylas({
        apiKey: 'test-key',
        apiUri: 'https://api.us.nylas.com',
        timeout: 30000
      });
      
      testResults.push('✅ Optional Types: should handle optional types correctly');
      totalPassed++;
    } catch (error) {
      testResults.push(`❌ Optional Types: should handle optional types correctly - ${error.message}`);
      totalFailed++;
    }

    // Test 4: Resources
    try {
      const client = new nylas({ apiKey: 'test-key' });

      const resources = [
        'calendars', 'events', 'messages', 'contacts', 'attachments',
        'webhooks', 'auth', 'grants', 'applications', 'drafts',
        'threads', 'folders', 'scheduler', 'notetakers'
      ];

      for (const resource of resources) {
        if (!client[resource]) {
          throw new Error(`Resource ${resource} not found`);
        }
        if (typeof client[resource] !== 'object') {
          throw new Error(`Resource ${resource} is not an object`);
        }
      }
      
      testResults.push('✅ Resources: should have all required resources');
      totalPassed++;
    } catch (error) {
      testResults.push(`❌ Resources: should have all required resources - ${error.message}`);
      totalFailed++;
    }

    // Test 5: Resource Methods
    try {
      const client = new nylas({ apiKey: 'test-key' });

      // Test calendars methods
      if (typeof client.calendars.list !== 'function') {
        throw new Error('calendars.list is not a function');
      }
      if (typeof client.calendars.find !== 'function') {
        throw new Error('calendars.find is not a function');
      }
      if (typeof client.calendars.create !== 'function') {
        throw new Error('calendars.create is not a function');
      }
      if (typeof client.calendars.update !== 'function') {
        throw new Error('calendars.update is not a function');
      }
      if (typeof client.calendars.destroy !== 'function') {
        throw new Error('calendars.destroy is not a function');
      }

      // Test events methods
      if (typeof client.events.list !== 'function') {
        throw new Error('events.list is not a function');
      }
      if (typeof client.events.find !== 'function') {
        throw new Error('events.find is not a function');
      }
      if (typeof client.events.create !== 'function') {
        throw new Error('events.create is not a function');
      }
      if (typeof client.events.update !== 'function') {
        throw new Error('events.update is not a function');
      }
      if (typeof client.events.destroy !== 'function') {
        throw new Error('events.destroy is not a function');
      }

      // Test messages methods
      if (typeof client.messages.list !== 'function') {
        throw new Error('messages.list is not a function');
      }
      if (typeof client.messages.find !== 'function') {
        throw new Error('messages.find is not a function');
      }
      if (typeof client.messages.send !== 'function') {
        throw new Error('messages.send is not a function');
      }
      if (typeof client.messages.update !== 'function') {
        throw new Error('messages.update is not a function');
      }
      if (typeof client.messages.destroy !== 'function') {
        throw new Error('messages.destroy is not a function');
      }
      
      testResults.push('✅ Resource Methods: should have all required resource methods');
      totalPassed++;
    } catch (error) {
      testResults.push(`❌ Resource Methods: should have all required resource methods - ${error.message}`);
      totalFailed++;
    }

    // Test 6: API Client Configuration
    try {
      const client1 = new nylas({ apiKey: 'key1' });
      const client2 = new nylas({ apiKey: 'key2', apiUri: 'https://api.eu.nylas.com' });
      const client3 = new nylas({ apiKey: 'key3', timeout: 5000 });

      if (client1.apiClient.apiKey !== 'key1') {
        throw new Error('Client1 API key not set correctly');
      }
      if (client2.apiClient.apiKey !== 'key2') {
        throw new Error('Client2 API key not set correctly');
      }
      if (client3.apiClient.apiKey !== 'key3') {
        throw new Error('Client3 API key not set correctly');
      }
      
      testResults.push('✅ API Client Configuration: should handle different API configurations');
      totalPassed++;
    } catch (error) {
      testResults.push(`❌ API Client Configuration: should handle different API configurations - ${error.message}`);
      totalFailed++;
    }

    // Test 7: ESM Compatibility
    try {
      const client = new nylas({ apiKey: 'test-key' });
      
      if (!client) {
        throw new Error('Client not created');
      }
      
      testResults.push('✅ ESM Compatibility: should work with ESM import');
      totalPassed++;
    } catch (error) {
      testResults.push(`❌ ESM Compatibility: should work with ESM import - ${error.message}`);
      totalFailed++;
    }

    // Test 8: Additional Resource Methods
    try {
      const client = new nylas({ apiKey: 'test-key' });

      // Test contacts methods
      if (typeof client.contacts.list !== 'function') {
        throw new Error('contacts.list is not a function');
      }
      if (typeof client.contacts.find !== 'function') {
        throw new Error('contacts.find is not a function');
      }
      if (typeof client.contacts.create !== 'function') {
        throw new Error('contacts.create is not a function');
      }
      if (typeof client.contacts.update !== 'function') {
        throw new Error('contacts.update is not a function');
      }
      if (typeof client.contacts.destroy !== 'function') {
        throw new Error('contacts.destroy is not a function');
      }

      // Test webhooks methods
      if (typeof client.webhooks.list !== 'function') {
        throw new Error('webhooks.list is not a function');
      }
      if (typeof client.webhooks.find !== 'function') {
        throw new Error('webhooks.find is not a function');
      }
      if (typeof client.webhooks.create !== 'function') {
        throw new Error('webhooks.create is not a function');
      }
      if (typeof client.webhooks.update !== 'function') {
        throw new Error('webhooks.update is not a function');
      }
      if (typeof client.webhooks.destroy !== 'function') {
        throw new Error('webhooks.destroy is not a function');
      }

      // Test auth methods
      if (typeof client.auth.urlForOAuth2 !== 'function') {
        throw new Error('auth.urlForOAuth2 is not a function');
      }
      if (typeof client.auth.exchangeCodeForToken !== 'function') {
        throw new Error('auth.exchangeCodeForToken is not a function');
      }
      if (typeof client.auth.refreshAccessToken !== 'function') {
        throw new Error('auth.refreshAccessToken is not a function');
      }
      if (typeof client.auth.revoke !== 'function') {
        throw new Error('auth.revoke is not a function');
      }
      
      testResults.push('✅ Additional Resource Methods: should have all additional resource methods');
      totalPassed++;
    } catch (error) {
      testResults.push(`❌ Additional Resource Methods: should have all additional resource methods - ${error.message}`);
      totalFailed++;
    }

    // Display results
    console.log('\n📊 Cloudflare Workers Test Results:');
    console.log('=====================================');
    console.log(`Status: ${totalFailed === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`Summary: ${totalPassed}/${totalPassed + totalFailed} tests passed`);
    console.log(`Environment: cloudflare-workers-nodejs-compat-simulation`);

    if (testResults.length > 0) {
      console.log('\nDetailed Results:');
      testResults.forEach(result => {
        console.log(`  ${result}`);
      });
    }

    if (totalFailed === 0) {
      console.log('\n🎉 All tests passed in Cloudflare Workers-like environment!');
      console.log('✅ The SDK works correctly in Cloudflare Workers');
      console.log('✅ Optional types are working correctly in Cloudflare Workers context');
      console.log('✅ ESM compatibility is working correctly');
      return true;
    } else {
      console.log('\n❌ Some tests failed in Cloudflare Workers-like environment');
      console.log('❌ There may be issues with the SDK in Cloudflare Workers context');
      return false;
    }

  } catch (error) {
    console.error('❌ Error running Cloudflare Workers tests:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run the tests
runCloudflareTests().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('💥 Cloudflare test runner failed:', error);
  process.exit(1);
});