/**
 * Simple Types Example: Using Nylas SDK Types
 * 
 * This example demonstrates how to use the Nylas SDK types for basic type safety
 * when working with the SDK in third-party applications.
 */

import type {
  NylasConfig,
  ListMessagesParams,
  FindEventParams,
  NylasResponse,
  NylasListResponse,
  Message,
  Event,
  Contact,
} from 'nylas/types';

// Import runtime values
import { DEFAULT_SERVER_URL, REGION_CONFIG } from 'nylas/types';

// Import the actual SDK for runtime functionality
import Nylas from 'nylas';

/**
 * Configuration Helper
 * Uses proper typing for configuration
 */
function createNylasConfig(apiKey: string): NylasConfig {
  const config: NylasConfig = {
    apiKey,
    apiUri: DEFAULT_SERVER_URL,
    timeout: 30,
    headers: {
      'X-Custom-Header': 'my-app-v1.0'
    }
  };

  return config;
}

/**
 * Message Handler
 * Uses proper typing for message operations
 */
class MessageHandler {
  private nylas: Nylas;

  constructor(config: NylasConfig) {
    this.nylas = new Nylas(config);
  }

  /**
   * Get messages with proper parameter typing
   */
  async getMessages(identifier: string, limit: number = 10): Promise<Message[]> {
    const params: ListMessagesParams = {
      identifier,
      queryParams: {
        limit,
        hasAttachment: false,
      }
    };

    const response = await this.nylas.messages.list(params);
    const firstPage = await response;
    
    return firstPage.data;
  }

  /**
   * Process message response with proper typing
   */
  processMessageResponse(response: NylasResponse<Message>): void {
    const message = response.data;
    
    console.log(`Message ID: ${message.id}`);
    console.log(`Subject: ${message.subject}`);
    console.log(`From: ${message.from?.[0]?.email || 'Unknown'}`);
    console.log(`Date: ${new Date(message.date * 1000).toLocaleDateString()}`);
    
    if (message.attachments && message.attachments.length > 0) {
      console.log(`Attachments: ${message.attachments.length}`);
    }
  }

  /**
   * Process message list response with proper typing
   */
  processMessageList(response: NylasListResponse<Message>): void {
    console.log(`Total messages: ${response.data.length}`);
    console.log(`Request ID: ${response.requestId}`);
    
    response.data.forEach((message, index) => {
      console.log(`${index + 1}. ${message.subject || 'No Subject'}`);
    });
  }
}

/**
 * Event Handler
 * Uses proper typing for event operations
 */
class EventHandler {
  private nylas: Nylas;

  constructor(config: NylasConfig) {
    this.nylas = new Nylas(config);
  }

  /**
   * Get event with proper parameter typing
   */
  async getEvent(identifier: string, eventId: string, calendarId: string): Promise<Event | null> {
    const params: FindEventParams = {
      identifier,
      eventId,
      queryParams: {
        calendarId,
      }
    };

    try {
      const response = await this.nylas.events.find(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  /**
   * Process event with proper typing
   */
  processEvent(event: Event): void {
    console.log(`Event: ${event.title || 'No Title'}`);
    console.log(`Calendar: ${event.calendarId}`);
    console.log(`Description: ${event.description || 'No Description'}`);
    
    if (event.participants && event.participants.length > 0) {
      console.log(`Participants: ${event.participants.length}`);
      event.participants.forEach(participant => {
        console.log(`  - ${participant.name || participant.email} (${participant.status})`);
      });
    }
  }
}

/**
 * Type-safe utility functions
 */
class TypeUtilities {
  /**
   * Check if response is successful
   */
  static isSuccessfulResponse<T>(response: NylasResponse<T>): boolean {
    return response.data !== null && response.data !== undefined;
  }

  /**
   * Extract email addresses from contacts
   */
  static extractEmailAddresses(contacts: Contact[]): string[] {
    return contacts
      .flatMap(contact => contact.emails)
      .map(email => email.email)
      .filter(email => email !== undefined);
  }

  /**
   * Format message for display
   */
  static formatMessageSummary(message: Message): string {
    const from = message.from?.[0]?.email || 'Unknown';
    const subject = message.subject || 'No Subject';
    const date = new Date(message.date * 1000).toLocaleDateString();
    
    return `From: ${from} | Subject: ${subject} | Date: ${date}`;
  }
}

/**
 * Demo function showing the types in action
 */
async function demonstrateTypes() {
  console.log('=== Nylas SDK Types Demo ===');
  
  // Create configuration with proper typing
  const config = createNylasConfig(process.env.NYLAS_API_KEY || 'demo-key');
  console.log('Configuration created:', {
    apiUri: config.apiUri,
    timeout: config.timeout,
    hasHeaders: !!config.headers
  });
  
  // Show available regions
  console.log('\nAvailable regions:');
  Object.entries(REGION_CONFIG).forEach(([region, config]) => {
    console.log(`  ${region}: ${config.nylasAPIUrl}`);
  });
  
  // Create handlers with proper typing
  const messageHandler = new MessageHandler(config);
  const eventHandler = new EventHandler(config);
  
  console.log('\n=== Type Safety Demo ===');
  
  // Example of type-safe parameter creation
  const messageParams: ListMessagesParams = {
    identifier: 'demo-grant-id',
    queryParams: {
      limit: 5,
      hasAttachment: false,
    }
  };
  
  console.log('Message parameters:', messageParams);
  
  // Example of type-safe event parameters
  const eventParams: FindEventParams = {
    identifier: 'demo-grant-id',
    eventId: 'demo-event-id',
    queryParams: {
      calendarId: 'primary',
    }
  };
  
  console.log('Event parameters:', eventParams);
  
     // Demo utility functions
   const demoMessage: Message = {
     id: 'demo-message-id',
     grantId: 'demo-grant-id',
     object: 'message',
     threadId: 'demo-thread-id',
     subject: 'Demo Message',
     from: [{ email: 'demo@example.com', name: 'Demo User' }],
     to: [{ email: 'recipient@example.com', name: 'Recipient' }],
     date: Math.floor(Date.now() / 1000),
     body: 'This is a demo message',
     folders: ['inbox'],
     attachments: [],
     unread: false,
     starred: false,
     snippet: 'This is a demo message',
     replyTo: [],
     cc: [],
     bcc: [],
   };
  
  console.log('\nFormatted message summary:');
  console.log(TypeUtilities.formatMessageSummary(demoMessage));
  
  console.log('\n=== Types Demo Complete ===');
}

// Export for use in other modules
export {
  MessageHandler,
  EventHandler,
  TypeUtilities,
  createNylasConfig,
};

// Only run if this file is executed directly
if (require.main === module) {
  demonstrateTypes().catch(console.error);
} 