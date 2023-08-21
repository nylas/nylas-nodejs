/**
 * This script generates the package.json files for the CJS and ESM builds.
 */

const fs = require('fs');
const path = require('path');

// Create the "lib/cjs/package.json" file
const cjsFolderPath = path.join(__dirname, '..', 'lib', 'cjs');
const cjsPackageJsonPath = path.join(cjsFolderPath, 'package.json');
const cjsContent = JSON.stringify({ type: 'commonjs' }, null, 2);

// Ensure the directory exists before writing the file
if (!fs.existsSync(cjsFolderPath)) {
  fs.mkdirSync(cjsFolderPath, { recursive: true });
}
fs.writeFileSync(cjsPackageJsonPath, cjsContent);

// Create the "lib/esm/package.json" file
const esmFolderPath = path.join(__dirname, '..', 'lib', 'esm');
const esmPackageJsonPath = path.join(esmFolderPath, 'package.json');
const esmContent = JSON.stringify({ type: 'module' }, null, 2);

// Ensure the directory exists before writing the file
if (!fs.existsSync(esmFolderPath)) {
  fs.mkdirSync(esmFolderPath, { recursive: true });
}
fs.writeFileSync(esmPackageJsonPath, esmContent);
