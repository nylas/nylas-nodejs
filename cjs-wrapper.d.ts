/**
 * TypeScript definitions for the CommonJS wrapper
 * This provides proper typing for CommonJS imports
 */

// Re-export all types from the main module
export * from './lib/types/models/index.js';

// Import the main Nylas class type
import Nylas from './lib/types/nylas.js';

// Export as both default and named for maximum compatibility
declare const nylasExport: typeof Nylas;
export = nylasExport;
