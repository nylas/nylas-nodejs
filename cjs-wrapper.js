/**
 * CommonJS wrapper for the Nylas SDK
 * This file provides CommonJS compatibility by re-exporting the default export
 * as the main module export while preserving named exports
 */

const nylasModule = require('./lib/cjs/nylas.js');

// Export the default export as the main module export for CJS compatibility
module.exports = nylasModule.default;

// Preserve all named exports
Object.assign(module.exports, nylasModule);
