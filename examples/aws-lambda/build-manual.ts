#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { execSync } from 'child_process';
// @ts-ignore - archiver types may not be available
const archiver = require('archiver');

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
    // Install production dependencies
    console.log('📦 Installing production dependencies...');
    execSync('npm install --production', { stdio: 'inherit', cwd: projectDir });

    // Build with esbuild (bundles everything including Nylas SDK)
    console.log('\n🔨 Bundling code with esbuild...');
    // Bundle everything except aws-sdk (provided by Lambda runtime)
    execSync(
      'npx esbuild src/handler.ts --bundle --platform=node --target=node20 --format=cjs --outfile=dist/handler.js --external:aws-sdk --bundle --minify',
      { stdio: 'inherit', cwd: projectDir }
    );

    // Note: Since we're bundling with esbuild, all dependencies (including Nylas SDK)
    // are included in the handler.js file, so we don't need to copy node_modules

    // Create zip file
    console.log('\n📦 Creating deployment package...');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

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
        console.log(
          '6. Configure environment variables (NYLAS_API_KEY, NYLAS_GRANT_ID, NYLAS_API_URI)'
        );
        console.log(
          '7. Create an API Gateway HTTP API and connect it to your Lambda'
        );
        resolve();
      });

      archive.on('error', (err: Error) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(distDir, false);
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
