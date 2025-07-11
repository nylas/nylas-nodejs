const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive release validation script
 * Ensures all quality gates pass before version bumps
 */

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`); // eslint-disable-line no-console
}

function runCommand(command, description) {
  log(`🔍 ${description}...`, 'blue');
  try {
    const result = execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    log(`✅ ${description} passed`, 'green');
    return result;
  } catch (error) {
    log(`❌ ${description} failed:`, 'red');
    console.error(error.stdout || error.message);
    throw error;
  }
}



function validateBuildOutput() {
  log('🔍 Validating build output...', 'blue');
  
  // Check if lib directory exists and has expected files
  const libPath = path.join(__dirname, '..', 'lib');
  if (!fs.existsSync(libPath)) {
    log('❌ lib directory does not exist', 'red');
    throw new Error('Build output missing');
  }
  
  // Check for main build outputs
  const mainCjsPath = path.join(libPath, 'cjs', 'nylas.js');
  const mainEsmPath = path.join(libPath, 'esm', 'nylas.js');
  const mainDtsPath = path.join(libPath, 'types', 'nylas.d.ts');
  
  if (!fs.existsSync(mainCjsPath)) {
    log('❌ CJS nylas.js build missing', 'red');
    throw new Error('CJS build missing');
  }
  
  if (!fs.existsSync(mainEsmPath)) {
    log('❌ ESM nylas.js build missing', 'red');
    throw new Error('ESM build missing');
  }
  
  if (!fs.existsSync(mainDtsPath)) {
    log('❌ TypeScript declaration nylas.d.ts missing', 'red');
    throw new Error('TypeScript declarations missing');
  }
  
  log('✅ Build output validation passed', 'green');
}

function validateExamples() {
  log('🔍 Validating examples...', 'blue');
  
  // Check if examples directory exists and examples can be compiled
  const examplesPath = path.join(__dirname, '..', 'examples');
  if (!fs.existsSync(examplesPath)) {
    log('⚠️  Examples directory not found, skipping validation', 'yellow');
    return;
  }
  
  try {
    // Try to compile the examples
    runCommand('cd examples && npx tsc --noEmit', 'Compiling examples');
    log('✅ Examples validation passed', 'green');
  } catch (error) {
    log('⚠️  Examples compilation failed, but continuing...', 'yellow');
    console.warn(error.message);
  }
}

async function main() {
  log('🚀 Starting release validation...', 'blue');
  
  try {
    // Step 1: Run linting
    runCommand('npm run lint:ci', 'Running linter');
    
    // Step 2: Run tests
    runCommand('npm test', 'Running tests');
    
    // Step 3: Clean build
    runCommand('npm run build', 'Building project');
    
    // Step 4: Validate build output
    validateBuildOutput();
    
    // Step 5: Validate examples (optional)
    validateExamples();
    
    // Step 6: Run test coverage
    runCommand('npm run test:coverage', 'Running test coverage');
    
    log('🎉 All release validation checks passed!', 'green');
    log('✅ Ready for version bump and release', 'green');
    
  } catch (error) {
    log('💥 Release validation failed!', 'red');
    log('❌ Please fix the issues above before releasing', 'red');
    process.exit(1);
  }
}

// Run validation if this script is called directly
if (require.main === module) {
  main();
} 