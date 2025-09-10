import dotenv from 'dotenv';
import path from 'path';
import * as process from 'process';
import Nylas from 'nylas';
import {
  Notetaker,
  Event,
  NylasResponse,
  NylasApiError,
  CreateEventRequest,
  UpdateEventRequest,
  NotetakerSettings,
} from 'nylas';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Check for required environment variables
const apiKey: string = process.env.NYLAS_API_KEY || '';
const grantId: string = process.env.NYLAS_GRANT_ID || '';
const calendarId: string = process.env.NYLAS_CALENDAR_ID || '';

if (!apiKey) {
  throw new Error('NYLAS_API_KEY environment variable is not set');
}
if (!grantId) {
  throw new Error('NYLAS_GRANT_ID environment variable is not set');
}
if (!calendarId) {
  throw new Error('NYLAS_CALENDAR_ID environment variable is not set');
}

// Initialize the Nylas client
const nylas = new Nylas({
  apiKey,
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
});

/**
 * Creates a calendar event with a Notetaker
 * @returns The created event
 */
async function createEventWithNotetaker(): Promise<NylasResponse<Event>> {
  console.log('\n=== Creating Event with Notetaker ===');

  try {
    // Calculate start and end times (1 day from now, 1 hour duration)
    const startTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours from now
    const endTime = startTime + 60 * 60; // 1 hour later

    // Create the request body
    const requestBody: CreateEventRequest = {
      title: 'Project Planning Meeting',
      description: 'Initial project planning and resource allocation',
      when: {
        startTime,
        endTime,
      },
      metadata: {
        project_id: 'PROJ-123',
        priority: 'high',
      },
      conferencing: {
        provider: 'Google Meet',
        autocreate: {},
      },
      notetaker: {
        name: 'Nylas Notetaker',
        meetingSettings: {
          videoRecording: true,
          audioRecording: true,
          transcription: true,
        },
      },
    };

    console.log(`Request body: ${JSON.stringify(requestBody, null, 2)}`);

    // Create the event
    const event = await nylas.events.create({
      identifier: grantId,
      requestBody,
      queryParams: {
        calendarId,
      },
    });

    console.log(`Created event with ID: ${event.data.id}`);
    if (event.data.notetaker) {
      console.log(`Event Notetaker ID: ${event.data.notetaker.id}`);
    }

    return event;
  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`Error creating event: ${error.message}`);
      console.error(`Error details: ${JSON.stringify(error, null, 2)}`);
    } else if (error instanceof Error) {
      console.error(
        `Unexpected error in createEventWithNotetaker: ${error.message}`
      );
      console.error(`Error type: ${error.constructor.name}`);
    }
    throw error;
  }
}

/**
 * Retrieves the Notetaker associated with an event
 * @param eventId The ID of the event to retrieve the Notetaker for
 * @returns The Notetaker associated with the event, or null if none found
 */
async function getEventNotetaker(
  eventId: string
): Promise<NylasResponse<Notetaker> | null> {
  console.log('\n=== Retrieving Event Notetaker ===');

  try {
    // First, retrieve the event to get the Notetaker ID
    const event = await nylas.events.find({
      identifier: grantId,
      eventId,
      queryParams: {
        calendarId,
      },
    });

    if (!event.data.notetaker || !event.data.notetaker.id) {
      console.log(`No Notetaker found for event ${eventId}`);
      return null;
    }

    // Get the Notetaker details
    const notetaker = await nylas.notetakers.find({
      identifier: grantId,
      notetakerId: event.data.notetaker.id,
    });

    console.log(`Found Notetaker for event ${eventId}:`);
    console.log(`- ID: ${notetaker.data.id}`);
    console.log(`- State: ${notetaker.data.state}`);
    console.log(`- Meeting Provider: ${notetaker.data.meetingProvider}`);
    console.log(`- Meeting Settings:`);
    console.log(
      `  - Video Recording: ${notetaker.data.meetingSettings.videoRecording}`
    );
    console.log(
      `  - Audio Recording: ${notetaker.data.meetingSettings.audioRecording}`
    );
    console.log(
      `  - Transcription: ${notetaker.data.meetingSettings.transcription}`
    );

    return notetaker;
  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`Error retrieving event notetaker: ${error.message}`);
      console.error(`Error details: ${JSON.stringify(error, null, 2)}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected error in getEventNotetaker: ${error.message}`);
      console.error(`Error type: ${error.constructor.name}`);
    }
    return null;
  }
}

/**
 * Updates both an event and its Notetaker
 * @param eventId The ID of the event to update
 * @param notetakerId The ID of the Notetaker to update
 * @returns The updated event
 */
async function updateEventAndNotetaker(
  eventId: string,
  notetakerId: string
): Promise<NylasResponse<Event>> {
  console.log('\n=== Updating Event and Notetaker ===');

  try {
    // Create the request body with updated event details and Notetaker settings
    const requestBody: UpdateEventRequest = {
      title: 'Updated Project Planning Meeting',
      description: 'Revised project planning with new timeline',
      metadata: {
        project_id: 'PROJ-123',
        priority: 'urgent',
      },
      notetaker: {
        id: notetakerId,
        name: 'Updated Nylas Notetaker',
        meetingSettings: {
          videoRecording: false,
          audioRecording: true,
          transcription: false,
        },
      },
    };

    console.log(`Request body: ${JSON.stringify(requestBody, null, 2)}`);

    // Update the event
    const updatedEvent = await nylas.events.update({
      identifier: grantId,
      eventId,
      requestBody,
      queryParams: {
        calendarId,
      },
    });

    console.log(`Updated event with ID: ${updatedEvent.data.id}`);
    if (updatedEvent.data.notetaker) {
      console.log(
        `Updated Event Notetaker ID: ${updatedEvent.data.notetaker.id}`
      );
    }

    return updatedEvent;
  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`Error updating event: ${error.message}`);
      console.error(`Error details: ${JSON.stringify(error, null, 2)}`);
    } else if (error instanceof Error) {
      console.error(
        `Unexpected error in updateEventAndNotetaker: ${error.message}`
      );
      console.error(`Error type: ${error.constructor.name}`);
    }
    throw error;
  }
}

/**
 * Main function to run all demo examples
 */
async function main(): Promise<void> {
  try {
    // Log API key (first few characters only)
    console.log(`Using API key: ${apiKey.substring(0, 5)}...`);
    console.log(`Using Grant ID: ${grantId.substring(0, 5)}...`);
    console.log(`Using Calendar ID: ${calendarId.substring(0, 5)}...`);

    // Create an event with a Notetaker
    const event = await createEventWithNotetaker();
    if (!event || !event.data.id) {
      console.error('Failed to create event');
      return;
    }

    // Get the Notetaker for the event
    const notetaker = await getEventNotetaker(event.data.id);
    if (!notetaker || !notetaker.data.id) {
      console.error(`Failed to get Notetaker for event ${event.data.id}`);
      return;
    }

    // Update both the event and its Notetaker
    const updatedEvent = await updateEventAndNotetaker(
      event.data.id,
      notetaker.data.id
    );
    if (!updatedEvent) {
      console.error(`Failed to update event ${event.data.id}`);
      return;
    }

    console.log(
      '\n=== Calendar Event with Notetaker Demo Completed Successfully ==='
    );
  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`\nNylas API Error: ${error.message}`);
      console.error(`Error details: ${JSON.stringify(error, null, 2)}`);
      process.exit(1);
    } else if (error instanceof Error) {
      console.error(`\nUnexpected Error: ${error.message}`);
      console.error(`Error type: ${error.constructor.name}`);
      process.exit(1);
    }
  }
}

// Run the main function
if (require.main === module) {
  main().catch(console.error);
}
