/**
 * This script appends the default export to the cjs build, allowing for a more seamless import.
 */

const fs = require('fs');
const path = require('path');

// Append the default export to the cjs build
const cjsEntryPointFile = path.join(__dirname, '..', 'lib', 'cjs', 'nylas.js');
fs.appendFileSync(cjsEntryPointFile, '\nmodule.exports = Nylas;\n');
