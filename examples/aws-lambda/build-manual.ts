#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { execSync } from 'child_process';

// Try to load archiver, provide helpful error if not found
let archiver: any;
try {
  // @ts-ignore - archiver types may not be available
  archiver = require('archiver');
} catch (error) {
  console.error('❌ Error: archiver module not found!');
  console.error('Please run: npm install');
  process.exit(1);
}

// Get __dirname for CommonJS/TypeScript
// @ts-ignore - __dirname is available in CommonJS context with ts-node
declare const __dirname: string;
const projectDir = __dirname || process.cwd();

async function buildForManualUpload(): Promise<void> {
  console.log('🔨 Building Lambda package for manual upload...\n');

  const distDir = path.join(projectDir, 'dist');
  const zipPath = path.join(projectDir, 'lambda-package.zip');

  // Clean previous builds
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  // Create dist directory
  fs.mkdirSync(distDir, { recursive: true });

  try {
    // Install all dependencies first (including devDependencies like archiver)
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit', cwd: projectDir });

    // Now require archiver after installation
    // @ts-ignore - archiver types may not be available
    const archiverModule = require('archiver');

    // Install production dependencies for the Lambda package
    console.log('\n📦 Installing production dependencies for Lambda...');
    execSync('npm install --production', { stdio: 'inherit', cwd: projectDir });

    // Build with esbuild (bundles everything including Nylas SDK)
    console.log('\n🔨 Bundling code with esbuild...');
    // Bundle everything except aws-sdk (provided by Lambda runtime)
    // Use format=cjs to ensure CommonJS exports work correctly
    // Note: Not using --minify to avoid potential export issues
    execSync(
      'npx esbuild src/handler.ts --bundle --platform=node --target=node20 --format=cjs --outfile=dist/handler.js --external:aws-sdk',
      { stdio: 'inherit', cwd: projectDir }
    );

    // Verify handler.js was created
    const handlerPath = path.join(distDir, 'handler.js');
    if (!fs.existsSync(handlerPath)) {
      throw new Error('handler.js was not created by esbuild');
    }

    // Verify handler export exists in the built file
    const handlerContent = fs.readFileSync(handlerPath, 'utf-8');
    // Check for various export patterns that esbuild might generate:
    // 1. Direct exports: exports.handler or module.exports.handler
    // 2. esbuild pattern: module.exports = __toCommonJS(handler_exports)
    // 3. Handler function definition
    const hasDirectExport =
      handlerContent.includes('exports.handler') ||
      handlerContent.includes('module.exports.handler') ||
      handlerContent.match(/exports\.handler\s*=/);

    const hasEsbuildExport =
      handlerContent.includes('module.exports = __toCommonJS') &&
      handlerContent.includes('handler_exports');

    const hasHandlerFunction =
      handlerContent.includes('const handler') ||
      handlerContent.includes('var handler') ||
      handlerContent.includes('function handler') ||
      handlerContent.includes('handler: () => handler');

    if (!hasDirectExport && !hasEsbuildExport && !hasHandlerFunction) {
      console.error('❌ Error: handler export not found in bundled file!');
      console.error(
        '   The handler must be exported as: exports.handler or module.exports.handler'
      );
      throw new Error('Handler export not found in bundled file');
    }

    console.log('✅ handler.js created successfully');
    if (hasDirectExport) {
      console.log('✅ Direct handler export verified');
    } else if (hasEsbuildExport) {
      console.log('✅ Handler export verified (esbuild __toCommonJS pattern)');
    } else if (hasHandlerFunction) {
      console.log(
        '✅ Handler function found (export pattern will be resolved at runtime)'
      );
    }

    // Note: Since we're bundling with esbuild, all dependencies (including Nylas SDK)
    // are included in the handler.js file, so we don't need to copy node_modules

    // Create zip file
    console.log('\n📦 Creating deployment package...');
    const output = fs.createWriteStream(zipPath);
    const archive = archiverModule('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
        console.log(`\n✅ Build complete!`);
        console.log(`📦 Package: ${zipPath}`);
        console.log(`📊 Size: ${sizeMB} MB`);
        console.log('\n📝 Next steps:');
        console.log('1. Go to AWS Lambda Console');
        console.log('2. Create a new function or select existing one');
        console.log('3. Upload the zip file: lambda-package.zip');
        console.log('4. Set handler to: handler.handler');
        console.log('5. Set runtime to: Node.js 20.x');
        console.log('6. Configure environment variables:');
        console.log('   - NYLAS_API_KEY');
        console.log('   - NYLAS_GRANT_ID');
        console.log(
          '   - NYLAS_API_URI (optional, defaults to https://api.us.nylas.com)'
        );
        console.log(
          '7. Create an API Gateway HTTP API and configure these routes:'
        );
        console.log('   - GET / → Lambda function');
        console.log('   - POST /send-attachment → Lambda function');
        console.log(
          '   - OPTIONS /{proxy+} → Lambda function (for CORS preflight)'
        );
        console.log(
          '   - ANY /{proxy+} → Lambda function (catch-all for other routes)'
        );
        console.log(
          '8. Enable CORS on all routes (or configure in Lambda response headers)'
        );
        console.log(
          '9. Deploy the API and test using the provided endpoint URL'
        );
        resolve();
      });

      archive.on('error', (err: Error) => {
        reject(err);
      });

      archive.pipe(output);
      // Add handler.js directly to root of zip (not in dist/ subdirectory)
      archive.file(path.join(distDir, 'handler.js'), { name: 'handler.js' });

      // Create a minimal package.json to ensure proper module resolution
      const packageJsonContent = JSON.stringify(
        {
          name: 'nylas-lambda-handler',
          version: '1.0.0',
          main: 'handler.js',
          type: 'commonjs',
        },
        null,
        2
      );
      archive.append(packageJsonContent, { name: 'package.json' });

      archive.finalize();
    });
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  buildForManualUpload().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export { buildForManualUpload };
