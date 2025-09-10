/**
 * CommonJS-Only Nylas SDK Example
 *
 * This example demonstrates how to use the Nylas Node.js SDK in a pure CommonJS
 * (CJS) environment without ES module syntax.
 *
 * Purpose:
 * - Shows CommonJS require() syntax with the Nylas SDK
 * - Demonstrates environment variable handling in CommonJS
 * - Provides a simple messages listing example
 *
 * Usage:
 * 1. Copy the parent examples/.env.example to examples/.env
 * 2. Fill in your NYLAS_API_KEY and NYLAS_GRANT_ID in the .env file
 * 3. Run: node index.js (or npm start)
 *
 * Requirements:
 * - Node.js with CommonJS support (any Node.js version)
 * - Valid Nylas API credentials
 * - A grant with message access permissions
 */

const dotenv = require('dotenv');
const path = require('path');
const Nylas = require('nylas');
const { logger, maskSecret } = require('./utils/logger.js');

// Load from parent directory since this example lives in a subdirectory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Fail fast if credentials are missing to provide clear error messages
const apiKey = process.env.NYLAS_API_KEY || '';
if (!apiKey) {
  throw new Error('NYLAS_API_KEY environment variable is not set');
}

const grantId = process.env.NYLAS_GRANT_ID || '';
if (!grantId) {
  throw new Error('NYLAS_GRANT_ID environment variable is not set');
}

// Initialize the Nylas client
const nylas = new Nylas({
  apiKey,
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
});

/**
 * Main function to demonstrate basic Nylas SDK usage in CommonJS environment
 */
async function main() {
  try {
    logger.info('Listing messages...');

    // Log runtime config for debugging without exposing sensitive data
    logger.debug('Runtime config', {
      apiKey: maskSecret(apiKey),
      grantId,
      apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
    });

    // Use basic list operation to verify SDK functionality and connectivity
    const messages = await nylas.messages.list({
      identifier: grantId,
    });

    logger.success('Messages listed successfully');

    // Extract only essential fields to avoid logging sensitive message content
    logger.info(
      'Message subjects and ids',
      messages.data.map((m) => ({ id: m.id, subject: m.subject }))
    );
  } catch (error) {
    logger.error('Failed to list messages');
    logger.debug('Error details', error);
    // Exit with error code to indicate failure for automation/CI purposes
    process.exit(1);
  }
}

main();
