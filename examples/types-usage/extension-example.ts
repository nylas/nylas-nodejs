/**
 * Extension Example: Building a Custom Nylas Extension
 * 
 * This example demonstrates how to build a custom extension on top of the Nylas SDK
 * using only the types, without importing the entire SDK.
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
  APIClient,
  RequestOptionsParams,
  Timespan,
  AsyncListResponse,
} from 'nylas/types';

// Import values that we need at runtime
import { Resource, WhenType } from 'nylas/types';

// Import the actual SDK for runtime functionality
import Nylas from 'nylas';

/**
 * Custom Analytics Extension
 * 
 * This extension provides analytics functionality for Nylas data
 * while maintaining full type safety.
 */
class NylasAnalytics {
  private nylas: Nylas;

  constructor(config: NylasConfig) {
    this.nylas = new Nylas(config);
  }

  /**
   * Analyze message patterns for a grant
   */
  async analyzeMessagePatterns(params: ListMessagesParams): Promise<MessageAnalytics> {
    const messagesIterator = this.nylas.messages.list(params);
    
    let totalMessages = 0;
    let totalSize = 0;
    const senders = new Map<string, number>();
    const subjects = new Map<string, number>();

    // Process each page of messages using async iteration
    for await (const page of messagesIterator) {
      for (const message of page.data) {
        totalMessages++;
        totalSize += message.body?.length || 0;
        
        // Count senders
        if (message.from && message.from.length > 0) {
          const sender = message.from[0].email;
          senders.set(sender, (senders.get(sender) || 0) + 1);
        }
        
        // Count subjects
        if (message.subject) {
          subjects.set(message.subject, (subjects.get(message.subject) || 0) + 1);
        }
      }
    }

    return {
      totalMessages,
      averageSize: totalMessages > 0 ? totalSize / totalMessages : 0,
      topSenders: Array.from(senders.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      topSubjects: Array.from(subjects.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    };
  }

  /**
   * Get event statistics for a time period
   */
  async getEventStatistics(
    identifier: string,
    startDate: string,
    endDate: string
  ): Promise<EventStatistics> {
    const eventParams: FindEventParams = {
      identifier,
      eventId: '', // This would be updated to use list events
      queryParams: {
        calendarId: '', // Would be set appropriately
        // Add date range filters
      }
    };

    // Note: In a real implementation, you'd use the events.list() method
    // This is just for type demonstration
    const events: Event[] = []; // Placeholder
    
    return {
      totalEvents: events.length,
      busyHours: this.analyzeBusyHours(events),
      eventTypes: this.analyzeEventTypes(events),
    };
  }

  /**
   * Create a smart contact group based on interaction patterns
   */
  async createSmartContactGroup(
    identifier: string,
    criteria: ContactGroupCriteria
  ): Promise<Contact[]> {
    // This would implement logic to analyze contacts and group them
    // based on interaction patterns, using proper types
    
    const contacts: Contact[] = [];
    
         // Example of using contact creation (CreateContactParams is not exported)
     // This would be used for creating contacts via the SDK
     const sampleContactData = {
       displayName: 'Sample Contact',
       emails: [{ email: 'sample@example.com' }],
       phoneNumbers: [],
       physicalAddresses: [],
       webPages: [],
       imAddresses: [],
       notes: 'Created by smart grouping',
     };

    return contacts;
  }

     private analyzeBusyHours(events: Event[]): { [hour: number]: number } {
     const busyHours: { [hour: number]: number } = {};
     
     events.forEach(event => {
       if (event.when && event.when.object === WhenType.Timespan) {
         const timespan = event.when as Timespan;
         const hour = new Date(timespan.startTime * 1000).getHours();
         busyHours[hour] = (busyHours[hour] || 0) + 1;
       }
     });

     return busyHours;
   }

  private analyzeEventTypes(events: Event[]): { [type: string]: number } {
    const eventTypes: { [type: string]: number } = {};
    
    events.forEach(event => {
      const type = event.title?.toLowerCase().includes('meeting') ? 'meeting' : 'other';
      eventTypes[type] = (eventTypes[type] || 0) + 1;
    });

    return eventTypes;
  }
}

/**
 * Custom Resource Extension
 * 
 * This shows how to extend the base Resource class to create custom resources
 * with full type safety.
 */
class CustomInsightsResource extends Resource {
  constructor(apiClient: APIClient) {
    super(apiClient);
  }

  /**
   * Get custom insights with proper typing
   */
  async getInsights(identifier: string): Promise<CustomInsights> {
    // Example of using the protected methods from Resource base class
    const requestOptions: RequestOptionsParams = {
      method: 'GET',
      path: `/v3/grants/${identifier}/insights`,
      queryParams: { format: 'json' },
    };

    // This would use the protected apiClient methods
    // For demonstration, we'll return a mock response
    return {
      messageCount: 100,
      eventCount: 50,
      contactCount: 25,
      insights: ['High email volume', 'Many meetings this week']
    };
  }
}

// Type definitions for the extension
interface MessageAnalytics {
  totalMessages: number;
  averageSize: number;
  topSenders: [string, number][];
  topSubjects: [string, number][];
}

interface EventStatistics {
  totalEvents: number;
  busyHours: { [hour: number]: number };
  eventTypes: { [type: string]: number };
}

interface ContactGroupCriteria {
  minInteractions: number;
  timeRange: string;
  includeEvents: boolean;
}

interface CustomInsights {
  messageCount: number;
  eventCount: number;
  contactCount: number;
  insights: string[];
}

// Example usage
async function demonstrateExtension() {
  // Configuration using proper types
  const config: NylasConfig = {
    apiKey: process.env.NYLAS_API_KEY || 'your-api-key',
    apiUri: 'https://api.us.nylas.com',
    timeout: 30,
  };

  // Create analytics extension
  const analytics = new NylasAnalytics(config);

  try {
    // Analyze message patterns
    const messageParams: ListMessagesParams = {
      identifier: 'grant-id',
      queryParams: { limit: 100 }
    };

    const messageAnalytics = await analytics.analyzeMessagePatterns(messageParams);
    console.log('Message Analytics:', messageAnalytics);

    // Get event statistics
    const eventStats = await analytics.getEventStatistics(
      'grant-id',
      '2024-01-01',
      '2024-01-31'
    );
    console.log('Event Statistics:', eventStats);

    // Create smart contact group
    const smartContacts = await analytics.createSmartContactGroup(
      'grant-id',
      { minInteractions: 5, timeRange: '30d', includeEvents: true }
    );
    console.log('Smart Contacts:', smartContacts.length);

  } catch (error) {
    console.error('Extension error:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  demonstrateExtension();
}

export { NylasAnalytics, CustomInsightsResource };
export type { MessageAnalytics, EventStatistics, ContactGroupCriteria, CustomInsights }; 