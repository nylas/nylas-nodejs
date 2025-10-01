#!/usr/bin/env node

/**
 * Run Nylas SDK tests in Cloudflare Workers environment using Wrangler
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Running Nylas SDK tests in Cloudflare Workers environment...\n');

async function runTestsWithWrangler() {
  const workerDir = join(__dirname, 'cloudflare-test-worker');
  
  console.log('📦 Using test worker:', workerDir);
  
  // Start Wrangler dev server
  console.log('🚀 Starting Wrangler dev server...');
  
  const wranglerProcess = spawn('wrangler', ['dev', '--local', '--port', '8793'], {
    cwd: workerDir,
    stdio: 'pipe'
  });
  
  // Wait for Wrangler to start
  console.log('⏳ Waiting for Wrangler to start...');
  await new Promise((resolve) => setTimeout(resolve, 15000));
  
  try {
    // Test the worker
    console.log('🧪 Running tests in Cloudflare Workers...');
    
    const response = await fetch('http://localhost:8793/test');
    const result = await response.json();
    
    console.log('\n📊 Test Results:');
    console.log('================');
    console.log(`Status: ${result.status}`);
    console.log(`Summary: ${result.summary}`);
    console.log(`Environment: ${result.environment}`);
    console.log('\nDetailed Results:');
    
    result.results.forEach(test => {
      const status = test.status === 'PASS' ? '✅' : '❌';
      console.log(`  ${status} ${test.name}`);
      if (test.error) {
        console.log(`     Error: ${test.error}`);
      }
    });
    
    if (result.status === 'PASS') {
      console.log('\n🎉 All tests passed in Cloudflare Workers environment!');
      console.log('✅ The SDK works correctly with ESM in Cloudflare Workers');
      return true;
    } else {
      console.log('\n❌ Some tests failed in Cloudflare Workers environment');
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
  
  const success = await runTestsWithWrangler();
  process.exit(success ? 0 : 1);
}

// Run the tests
main().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});