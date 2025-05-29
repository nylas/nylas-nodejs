import * as dotenv from 'dotenv';
import * as path from 'path';
import * as process from 'process';
import Nylas from 'nylas';
import { 
  Message,
  MessageFields,
  MessageTrackingOptions,
  SendMessageRequest,
  UpdateMessageRequest,
  CleanMessagesRequest,
  ScheduledMessage,
  NylasResponse,
  NylasListResponse,
  NylasApiError,
  ListMessagesQueryParams
} from 'nylas';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Check for required environment variables
const apiKey: string = process.env.NYLAS_API_KEY || '';
const grantId: string = process.env.NYLAS_GRANT_ID || '';

if (!apiKey) {
  throw new Error('NYLAS_API_KEY environment variable is not set');
}
if (!grantId) {
  throw new Error('NYLAS_GRANT_ID environment variable is not set');
}

// Initialize the Nylas client
const nylas = new Nylas({
  apiKey,
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com'
});

/**
 * Demonstrates listing messages with different field options
 */
async function demonstrateMessageFields(): Promise<void> {
  console.log('\n=== Demonstrating Message Fields ===');
  
  try {
    // 1. List messages with standard fields
    console.log('\n--- Listing messages with standard fields ---');
    const standardMessages = await nylas.messages.list({
      identifier: grantId,
      queryParams: {
        fields: MessageFields.STANDARD,
        limit: 2
      }
    });
    
    console.log(`Found ${standardMessages.data.length} messages with standard fields`);
    for (const message of standardMessages.data) {
      console.log(`- ${message.id}: ${message.subject || '(no subject)'}`);
      console.log(`  From: ${message.from?.map(f => `${f.name} <${f.email}>`).join(', ') || 'Unknown'}`);
      console.log(`  Tracking Options: ${message.trackingOptions ? 'Present' : 'Not present'}`);
      console.log(`  Headers: ${message.headers ? 'Present' : 'Not present'}`);
      console.log(`  Raw MIME: ${message.rawMime ? 'Present' : 'Not present'}`);
    }

    // 2. List messages with tracking options
    console.log('\n--- Listing messages with tracking options ---');
    const trackingMessages = await nylas.messages.list({
      identifier: grantId,
      queryParams: {
        fields: MessageFields.INCLUDE_TRACKING_OPTIONS,
        limit: 2
      }
    });
    
    console.log(`Found ${trackingMessages.data.length} messages with tracking options`);
    for (const message of trackingMessages.data) {
      console.log(`- ${message.id}: ${message.subject || '(no subject)'}`);
      if (message.trackingOptions) {
        console.log(`  Tracking Options:`);
        console.log(`    Opens: ${message.trackingOptions.opens}`);
        console.log(`    Thread Replies: ${message.trackingOptions.threadReplies}`);
        console.log(`    Links: ${message.trackingOptions.links}`);
        console.log(`    Label: ${message.trackingOptions.label}`);
      } else {
        console.log(`  No tracking options available`);
      }
    }

    // 3. List messages with headers
    console.log('\n--- Listing messages with headers ---');
    const headerMessages = await nylas.messages.list({
      identifier: grantId,
      queryParams: {
        fields: MessageFields.INCLUDE_HEADERS,
        limit: 2
      }
    });
    
    console.log(`Found ${headerMessages.data.length} messages with headers`);
    for (const message of headerMessages.data) {
      console.log(`- ${message.id}: ${message.subject || '(no subject)'}`);
      if (message.headers && message.headers.length > 0) {
        console.log(`  Headers (showing first 3):`);
        message.headers.slice(0, 3).forEach(header => {
          console.log(`    ${header.name}: ${header.value.substring(0, 100)}${header.value.length > 100 ? '...' : ''}`);
        });
        if (message.headers.length > 3) {
          console.log(`    ... and ${message.headers.length - 3} more headers`);
        }
      } else {
        console.log(`  No headers available`);
      }
    }

  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`Error demonstrating message fields: ${error.message}`);
      console.error(`Error details: ${JSON.stringify(error, null, 2)}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected error in demonstrateMessageFields: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Demonstrates getting raw MIME data for a message
 */
async function demonstrateRawMime(): Promise<void> {
  console.log('\n=== Demonstrating Raw MIME Data ===');
  
  try {
    // First, get a message ID
    const messages = await nylas.messages.list({
      identifier: grantId,
      queryParams: {
        limit: 1
      }
    });
    
    if (messages.data.length === 0) {
      console.log('No messages available to demonstrate raw MIME');
      return;
    }
    
    const messageId = messages.data[0].id;
    console.log(`Getting raw MIME data for message: ${messageId}`);
    
    // Get the message with raw MIME data
    const rawMessage = await nylas.messages.find({
      identifier: grantId,
      messageId,
      queryParams: {
        fields: MessageFields.RAW_MIME
      }
    });
    
    console.log('Raw MIME Response:');
    console.log(`- ID: ${rawMessage.data.id}`);
    console.log(`- Grant ID: ${rawMessage.data.grantId}`);
    console.log(`- Object: ${rawMessage.data.object}`);
    
    if (rawMessage.data.rawMime) {
      console.log(`- Raw MIME Data: ${rawMessage.data.rawMime.substring(0, 100)}... (truncated)`);
      console.log(`- Raw MIME Length: ${rawMessage.data.rawMime.length} characters`);
      
      // Note: When requesting raw_mime, only grant_id, object, id, and raw_mime fields are returned
      console.log('\nNote: When requesting raw_mime, only specific fields are returned:');
      console.log(`- Subject: ${rawMessage.data.subject || 'Not included'}`);
      console.log(`- Body: ${rawMessage.data.body ? 'Present' : 'Not included'}`);
      console.log(`- From: ${rawMessage.data.from ? 'Present' : 'Not included'}`);
    } else {
      console.log('- Raw MIME Data: Not available');
    }
    
  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`Error demonstrating raw MIME: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected error in demonstrateRawMime: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Demonstrates sending a message with tracking enabled
 */
async function demonstrateMessageSending(): Promise<NylasResponse<Message> | null> {
  console.log('\n=== Demonstrating Message Sending ===');
  
  try {
    const testEmail = process.env.TEST_EMAIL;
    if (!testEmail) {
      console.log('TEST_EMAIL environment variable not set. Skipping message sending demo.');
      console.log('Set TEST_EMAIL=your-email@example.com to test message sending.');
      return null;
    }
    
    console.log(`Sending test message to: ${testEmail}`);
    
    const requestBody: SendMessageRequest = {
      to: [{ 
        name: 'Test Recipient', 
        email: testEmail 
      }],
      subject: 'Nylas SDK Messages Example - Testing New Features',
      body: `
        <html>
          <body>
            <h2>Nylas SDK Messages Example</h2>
            <p>This message demonstrates the new tracking features in the Nylas Node.js SDK.</p>
            <p>Features being tested:</p>
            <ul>
              <li>Message tracking options</li>
              <li>Raw MIME data support</li>
              <li>Enhanced field querying</li>
            </ul>
            <p>Visit <a href="https://developer.nylas.com">Nylas Developer Docs</a> for more information.</p>
            <p>Best regards,<br>The Nylas SDK Team</p>
          </body>
        </html>
      `
      // Note: Tracking options are configured at the API/provider level, not in the request
    };
    
    console.log('Sending message with tracking...');
    const sentMessage = await nylas.messages.send({
      identifier: grantId,
      requestBody
    });
    
    console.log(`Message sent successfully!`);
    console.log(`- Message ID: ${sentMessage.data.id}`);
    console.log(`- Subject: ${sentMessage.data.subject}`);
    console.log(`- To: ${sentMessage.data.to?.map(t => `${t.name} <${t.email}>`).join(', ')}`);
    
    return sentMessage;
    
  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`Error sending message: ${error.message}`);
      console.error(`Error details: ${JSON.stringify(error, null, 2)}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected error in demonstrateMessageSending: ${error.message}`);
    }
    return null;
  }
}

/**
 * Demonstrates updating a message
 */
async function demonstrateMessageUpdate(messageId: string): Promise<void> {
  console.log('\n=== Demonstrating Message Update ===');
  
  try {
    console.log(`Updating message: ${messageId}`);
    
    const updateRequest: UpdateMessageRequest = {
      starred: true,
      unread: false,
      metadata: {
        example_type: 'sdk_demo',
        feature_test: 'tracking_and_mime',
        updated_at: new Date().toISOString(),
        status: 'processed'
      }
    };
    
    const updatedMessage = await nylas.messages.update({
      identifier: grantId,
      messageId,
      requestBody: updateRequest
    });
    
    console.log('Message updated successfully!');
    console.log(`- Message ID: ${updatedMessage.data.id}`);
    console.log(`- Starred: ${updatedMessage.data.starred}`);
    console.log(`- Unread: ${updatedMessage.data.unread}`);
    console.log(`- Metadata: ${JSON.stringify(updatedMessage.data.metadata, null, 2)}`);
    
  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`Error updating message: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected error in demonstrateMessageUpdate: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Demonstrates scheduled messages
 */
async function demonstrateScheduledMessages(): Promise<void> {
  console.log('\n=== Demonstrating Scheduled Messages ===');
  
  try {
    // List scheduled messages
    console.log('Listing scheduled messages...');
    const scheduledMessages = await nylas.messages.listScheduledMessages({
      identifier: grantId
    });
    
    // Handle case where schedules might be undefined or empty
    const schedules = scheduledMessages.data.schedules || [];
    console.log(`Found ${schedules.length} scheduled messages`);
    
    if (schedules.length === 0) {
      console.log('No scheduled messages found. This is normal if you haven\'t scheduled any messages.');
      return;
    }
    
    for (const schedule of schedules) {
      console.log(`- Schedule ID: ${schedule.scheduleId}`);
      console.log(`  Status: ${schedule.status.code} - ${schedule.status.description}`);
      if (schedule.closeTime) {
        console.log(`  Close Time: ${new Date(schedule.closeTime * 1000).toISOString()}`);
      }
    }
    
    // If there are scheduled messages, demonstrate finding one
    const firstSchedule = schedules[0];
    console.log(`\nGetting details for scheduled message: ${firstSchedule.scheduleId}`);
    
    const scheduleDetails = await nylas.messages.findScheduledMessage({
      identifier: grantId,
      scheduleId: firstSchedule.scheduleId.toString()
    });
    
    console.log('Scheduled message details:');
    console.log(`- Schedule ID: ${scheduleDetails.data.scheduleId}`);
    console.log(`- Status: ${scheduleDetails.data.status.code} - ${scheduleDetails.data.status.description}`);
    
  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`Error with scheduled messages: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected error in demonstrateScheduledMessages: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Demonstrates message cleaning
 */
async function demonstrateMessageCleaning(): Promise<void> {
  console.log('\n=== Demonstrating Message Cleaning ===');
  
  try {
    // Get a few message IDs for cleaning
    const messages = await nylas.messages.list({
      identifier: grantId,
      queryParams: {
        limit: 2
      }
    });
    
    if (messages.data.length === 0) {
      console.log('No messages available for cleaning demonstration');
      return;
    }
    
    const messageIds = messages.data.map(m => m.id);
    console.log(`Cleaning ${messageIds.length} messages...`);
    
    const cleanRequest: CleanMessagesRequest = {
      messageId: messageIds,
      ignoreLinks: true,
      ignoreImages: true,
      ignoreTables: false,
      imagesAsMarkdown: false,
      removeConclusionPhrases: true
    };
    
    const cleanedMessages = await nylas.messages.cleanMessages({
      identifier: grantId,
      requestBody: cleanRequest
    });
    
    console.log(`Successfully cleaned ${cleanedMessages.data.length} messages`);
    for (const cleanedMessage of cleanedMessages.data) {
      console.log(`- Message ID: ${cleanedMessage.id}`);
      console.log(`  Original body length: ${cleanedMessage.body?.length || 0} characters`);
      console.log(`  Cleaned conversation length: ${cleanedMessage.conversation?.length || 0} characters`);
      if (cleanedMessage.conversation) {
        const preview = cleanedMessage.conversation.substring(0, 100);
        console.log(`  Cleaned preview: ${preview}${cleanedMessage.conversation.length > 100 ? '...' : ''}`);
      }
    }
    
  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`Error cleaning messages: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected error in demonstrateMessageCleaning: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Demonstrates querying messages with various filters
 */
async function demonstrateMessageQuerying(): Promise<void> {
  console.log('\n=== Demonstrating Message Querying ===');
  
  try {
    // Query recent unread messages
    console.log('\n--- Finding recent unread messages ---');
    const unreadMessages = await nylas.messages.list({
      identifier: grantId,
      queryParams: {
        unread: true,
        limit: 5,
        fields: MessageFields.INCLUDE_TRACKING_OPTIONS
      }
    });
    
    console.log(`Found ${unreadMessages.data.length} unread messages`);
    for (const message of unreadMessages.data) {
      console.log(`- ${message.id}: ${message.subject || '(no subject)'}`);
      console.log(`  Date: ${new Date(message.date * 1000).toISOString()}`);
      console.log(`  From: ${message.from?.map(f => `${f.name} <${f.email}>`).join(', ') || 'Unknown'}`);
    }
    
    // Query messages with attachments
    console.log('\n--- Finding messages with attachments ---');
    const attachmentMessages = await nylas.messages.list({
      identifier: grantId,
      queryParams: {
        hasAttachment: true,
        limit: 3
      }
    });
    
    console.log(`Found ${attachmentMessages.data.length} messages with attachments`);
    for (const message of attachmentMessages.data) {
      console.log(`- ${message.id}: ${message.subject || '(no subject)'}`);
      console.log(`  Attachments: ${message.attachments?.length || 0}`);
      if (message.attachments && message.attachments.length > 0) {
        message.attachments.forEach(att => {
          console.log(`    - ${att.filename} (${att.contentType}, ${att.size} bytes)`);
        });
      }
    }
    
  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`Error querying messages: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected error in demonstrateMessageQuerying: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Main function to run all message examples
 */
async function main(): Promise<void> {
  try {
    console.log('=== Nylas Messages API Examples ===');
    console.log(`API Key: ${apiKey.substring(0, 8)}...`);
    console.log(`Grant ID: ${grantId}`);
    console.log(`API URI: ${process.env.NYLAS_API_URI || 'https://api.us.nylas.com'}`);
    
    // Run all demonstrations
    await demonstrateMessageFields();
    await demonstrateRawMime();
    await demonstrateMessageQuerying();
    
    // Send a message if TEST_EMAIL is provided
    const sentMessage = await demonstrateMessageSending();
    
    // If we sent a message, demonstrate updating it
    if (sentMessage) {
      await demonstrateMessageUpdate(sentMessage.data.id);
    }
    
    await demonstrateScheduledMessages();
    await demonstrateMessageCleaning();
    
    console.log('\n=== All message examples completed successfully! ===');
    
  } catch (error) {
    console.error('\n=== Error running message examples ===');
    if (error instanceof NylasApiError) {
      console.error(`Nylas API Error: ${error.message}`);
      console.error(`Status Code: ${error.statusCode}`);
      console.error(`Request ID: ${error.requestId}`);
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main();
} 