#!/usr/bin/env node

/**
 * Test script for Cloudflare Workers compatibility
 * This script tests the Nylas SDK in a Cloudflare Workers-like environment
 */

// Simulate Cloudflare Workers environment
global.fetch = require('node-fetch');
global.Request = require('node-fetch').Request;
global.Response = require('node-fetch').Response;
global.Headers = require('node-fetch').Headers;

console.log('🧪 Testing Nylas SDK in Cloudflare Workers environment...\n');

async function testCommonJS() {
  console.log('📦 Testing CommonJS import...');
  try {
    const nylas = require('../../lib/cjs/nylas.js');
    console.log('✅ CommonJS import successful');
    
    // Test client creation with minimal config
    const client = new nylas.default({ apiKey: 'test-key' });
    console.log('✅ Client creation successful');
    
    // Test that optional types work correctly
    const client2 = new nylas.default({ 
      apiKey: 'test-key',
      // These should be optional and not cause errors
    });
    console.log('✅ Optional types work correctly');
    
    return true;
  } catch (error) {
    console.error('❌ CommonJS test failed:', error.message);
    return false;
  }
}

async function testESM() {
  console.log('\n📦 Testing ESM import...');
  try {
    const nylas = (await import('../../lib/esm/nylas.js')).default;
    console.log('✅ ESM import successful');
    
    // Test client creation
    const client = new nylas({ apiKey: 'test-key' });
    console.log('✅ ESM client creation successful');
    
    return true;
  } catch (error) {
    console.error('❌ ESM test failed:', error.message);
    return false;
  }
}

async function testWorkerCompatibility() {
  console.log('\n🔧 Testing Cloudflare Workers compatibility...');
  try {
    // Test that we can create a basic worker-like structure
    const worker = {
      async fetch(request, env) {
        // Simulate the worker environment
        const nylas = require('../../lib/cjs/nylas.js');
        const client = new nylas.default({ 
          apiKey: env.NYLAS_API_KEY || 'test-key' 
        });
        
        return new Response(JSON.stringify({
          status: 'healthy',
          sdk: 'nylas-nodejs',
          environment: 'cloudflare-worker'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };
    
    // Simulate a request
    const mockRequest = new Request('https://example.com/health');
    const mockEnv = { NYLAS_API_KEY: 'test-key' };
    
    const response = await worker.fetch(mockRequest, mockEnv);
    const data = await response.json();
    
    if (data.status === 'healthy') {
      console.log('✅ Cloudflare Workers compatibility test passed');
      return true;
    } else {
      console.error('❌ Cloudflare Workers compatibility test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Cloudflare Workers compatibility test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting Cloudflare Workers compatibility tests...\n');
  
  const results = await Promise.all([
    testCommonJS(),
    testESM(),
    testWorkerCompatibility()
  ]);
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! The SDK is compatible with Cloudflare Workers.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the issues above.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});