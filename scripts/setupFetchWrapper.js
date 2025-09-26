/**
 * Script to copy the appropriate fetchWrapper implementation based on build type
 */

const fs = require('fs');
const path = require('path');

const buildType = process.argv[2]; // 'esm' or 'cjs'

if (!buildType || !['esm', 'cjs'].includes(buildType)) {
  console.error('Usage: node setupFetchWrapper.js <esm|cjs>');
  process.exit(1);
}

const srcDir = path.join(__dirname, '..', 'src', 'utils');
const sourceFile = path.join(srcDir, `fetchWrapper-${buildType}.ts`);
const targetFile = path.join(srcDir, 'fetchWrapper.ts');

// Ensure source file exists
if (!fs.existsSync(sourceFile)) {
  console.error(`Source file ${sourceFile} does not exist`);
  process.exit(1);
}

// Copy the appropriate implementation
fs.copyFileSync(sourceFile, targetFile);
/* eslint-disable no-console */
console.log(`✅ Copied fetchWrapper-${buildType}.ts to fetchWrapper.ts`);
/* eslint-enable no-console */
