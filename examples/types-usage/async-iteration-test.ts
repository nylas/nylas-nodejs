/**
 * Test file demonstrating the correct async iteration pattern
 * This shows how the type error was fixed in the extension example
 */

import type { ListMessagesParams, NylasConfig } from 'nylas/types';
import Nylas from 'nylas';

async function testAsyncIteration() {
  const config: NylasConfig = {
    apiKey: 'demo-key',
    apiUri: 'https://api.us.nylas.com',
  };

  const nylas = new Nylas(config);

  const params: ListMessagesParams = {
    identifier: 'demo-grant-id',
    queryParams: { limit: 5 }
  };

  try {
    // ✅ CORRECT: Use the async iterator directly without awaiting first
    const messagesIterator = nylas.messages.list(params);
    
    console.log('Processing messages using async iteration...');
    
    for await (const page of messagesIterator) {
      console.log(`Found ${page.data.length} messages in this page`);
      
      for (const message of page.data) {
        console.log(`- Message: ${message.subject || 'No Subject'}`);
      }
      
      // Break after first page for demo
      break;
    }
    
    console.log('Async iteration completed successfully!');
    
  } catch (error) {
    console.log('Expected error for demo credentials:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// ❌ INCORRECT PATTERN (this would cause the type error):
// const messages = await nylas.messages.list(params);
// for await (const page of messages) { ... }

// ✅ CORRECT PATTERN (this is what we fixed):
// const messagesIterator = nylas.messages.list(params);
// for await (const page of messagesIterator) { ... }

if (require.main === module) {
  testAsyncIteration();
}

export { testAsyncIteration }; 