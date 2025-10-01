#!/usr/bin/env node

/**
 * Run ALL 25 Vitest tests in Cloudflare Workers environment
 * This runs our actual Vitest test suite in the Cloudflare Workers nodejs_compat environment
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Running ALL 25 Vitest tests in Cloudflare Workers environment...\n');

async function runVitestTestsInCloudflare() {
  const workerDir = join(__dirname, 'cloudflare-vitest-runner');
  
  console.log('📦 Using Vitest test runner worker:', workerDir);
  
  // Start Wrangler dev server
  console.log('🚀 Starting Wrangler dev server...');
  
  const wranglerProcess = spawn('wrangler', ['dev', '--local', '--port', '8796'], {
    cwd: workerDir,
    stdio: 'pipe'
  });
  
  // Wait for Wrangler to start
  console.log('⏳ Waiting for Wrangler to start...');
  await new Promise((resolve) => setTimeout(resolve, 15000));
  
  try {
    // Run the tests
    console.log('🧪 Running Vitest test suite in Cloudflare Workers...');
    
    const response = await fetch('http://localhost:8796/test');
    const result = await response.json();
    
    console.log('\n📊 Vitest Test Results:');
    console.log('======================');
    console.log(`Status: ${result.status}`);
    console.log(`Summary: ${result.summary}`);
    console.log(`Environment: ${result.environment}`);
    
    if (result.vitestResult) {
      console.log(`\nVitest Details:`);
      console.log(`  Files: ${result.vitestResult.files}`);
      console.log(`  Tests: ${result.vitestResult.tests}`);
      console.log(`  Passed: ${result.vitestResult.passed}`);
      console.log(`  Failed: ${result.vitestResult.failed}`);
      console.log(`  Duration: ${result.vitestResult.duration}ms`);
    }
    
    if (result.results && result.results.length > 0) {
      console.log('\nDetailed Results:');
      result.results.forEach(testResult => {
        console.log(`  ${testResult}`);
      });
    }
    
    if (result.status === 'PASS') {
      console.log('\n🎉 All Vitest tests passed in Cloudflare Workers environment!');
      console.log('✅ The SDK works correctly with Vitest in Cloudflare Workers');
      console.log('✅ Optional types are working correctly in Cloudflare Workers context');
      return true;
    } else if (result.status === 'ERROR') {
      console.log('\n❌ Error running Vitest tests in Cloudflare Workers environment');
      console.log(`❌ Error: ${result.summary}`);
      if (result.error) {
        console.log(`❌ Stack: ${result.error}`);
      }
      return false;
    } else {
      console.log('\n❌ Some Vitest tests failed in Cloudflare Workers environment');
      console.log('❌ There may be issues with the SDK in Cloudflare Workers context');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error running Vitest tests:', error.message);
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
  
  const success = await runVitestTestsInCloudflare();
  process.exit(success ? 0 : 1);
}

// Run the tests
main().catch(error => {
  console.error('💥 Vitest test runner failed:', error);
  process.exit(1);
});