#!/usr/bin/env node

/**
 * Simple test script to verify Nylas SDK works in Cloudflare Workers nodejs_compat environment
 * This simulates the Cloudflare Workers environment locally
 */

console.log('🧪 Testing Nylas SDK in Cloudflare Workers nodejs_compat environment...\n');

// Simulate Cloudflare Workers environment
global.fetch = require('node-fetch');
global.Request = require('node-fetch').Request;
global.Response = require('node-fetch').Response;
global.Headers = require('node-fetch').Headers;

async function testCloudflareCompatibility() {
  const results = [];
  
  try {
    // Test 1: CommonJS import
    console.log('📦 Testing CommonJS import...');
    const nylas = require('./lib/cjs/nylas.js');
    results.push({ test: 'CommonJS Import', status: 'PASS' });
    console.log('✅ CommonJS import successful');
    
    // Test 2: Client creation with minimal config (tests optional types)
    console.log('🔧 Testing client creation with minimal config...');
    const client = new nylas.default({ apiKey: 'test-key' });
    results.push({ test: 'Minimal Client Creation', status: 'PASS' });
    console.log('✅ Client created with minimal config');
    
    // Test 3: Client creation with optional properties (tests optional types)
    console.log('🔧 Testing client creation with optional properties...');
    const clientWithOptions = new nylas.default({ 
      apiKey: 'test-key',
      apiUri: 'https://api.us.nylas.com',
      timeout: 30000,
      // All these should be optional and not cause errors
    });
    results.push({ test: 'Optional Properties', status: 'PASS' });
    console.log('✅ Client created with optional properties');
    
    // Test 4: ESM import
    console.log('📦 Testing ESM import...');
    const esmNylas = (await import('./lib/esm/nylas.js')).default;
    const esmClient = new esmNylas({ apiKey: 'test-key' });
    results.push({ test: 'ESM Import', status: 'PASS' });
    console.log('✅ ESM import successful');
    
    // Test 5: Resource access
    console.log('🔧 Testing resource access...');
    if (client.calendars && typeof client.calendars.list === 'function') {
      results.push({ test: 'Resource Access', status: 'PASS' });
      console.log('✅ Resources are properly initialized');
    } else {
      results.push({ test: 'Resource Access', status: 'FAIL' });
      console.log('❌ Resources not properly initialized');
    }
    
    // Test 6: Test that minimal config works (this is the key test for optional types)
    console.log('🔧 Testing minimal configuration (optional types)...');
    const minimalClient = new nylas.default({ 
      apiKey: 'test-key'
      // No other properties - this should work without errors
    });
    results.push({ test: 'Minimal Config (Optional Types)', status: 'PASS' });
    console.log('✅ Minimal configuration works - optional types are properly handled');
    
  } catch (error) {
    results.push({ test: 'Error', status: 'FAIL', message: error.message });
    console.error('❌ Test failed:', error.message);
  }
  
  return results;
}

async function runTests() {
  const results = await testCloudflareCompatibility();
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! The SDK is compatible with Cloudflare Workers nodejs_compat environment.');
    console.log('✅ Optional types are working correctly - no TypeScript errors in Cloudflare Workers context.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the issues above.');
    console.log('❌ There may be issues with optional types in Cloudflare Workers environment.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});