import dotenv from 'dotenv';
import path from 'path';
import * as process from 'process';
import Nylas from 'nylas';
import { 
  CreateNotetakerRequest, 
  NotetakerMedia, 
  NotetakerLeaveResponse, 
  Notetaker,
  NylasResponse, 
  NylasListResponse,
  NylasApiError
} from 'nylas';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Check for required environment variables
const apiKey: string = process.env.NYLAS_API_KEY || '';
if (!apiKey) {
  throw new Error('NYLAS_API_KEY environment variable is not set');
}

// Initialize the Nylas client
const nylas = new Nylas({
  apiKey,
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com'
});

/**
 * Invites a Notetaker to a meeting
 * @returns The created Notetaker
 */
async function inviteNotetaker(): Promise<NylasResponse<Notetaker>> {
  console.log('\n=== Inviting Notetaker to Meeting ===');
  
  try {
    const meetingLink: string = process.env.MEETING_LINK || '';
    if (!meetingLink) {
      throw new Error('MEETING_LINK environment variable is not set. Please set it with your meeting URL.');
    }
    
    const requestBody: CreateNotetakerRequest = {
      meetingLink,
      name: 'Nylas Notetaker',
      meetingSettings: {
        videoRecording: true,
        audioRecording: true,
        transcription: true
      }
    };
    
    console.log(`Request body: ${JSON.stringify(requestBody, null, 2)}`);
    
    const notetaker = await nylas.notetakers.create({ requestBody });
    
    console.log(`Invited Notetaker with ID: ${notetaker.data.id}`);
    console.log(`Name: ${notetaker.data.name}`);
    console.log(`State: ${notetaker.data.state}`);
    return notetaker;
  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`Error inviting notetaker: ${error.message}`);
      console.error(`Error details: ${JSON.stringify(error, null, 2)}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected error in invite_notetaker: ${error.message}`);
      console.error(`Error type: ${error.constructor.name}`);
    }
    throw error;
  }
}

/**
 * Lists all Notetakers
 * @returns A list of Notetakers
 */
async function listNotetakers(): Promise<NylasListResponse<Notetaker>> {
  console.log('\n=== Listing All Notetakers ===');
  
  try {
    const notetakers = await nylas.notetakers.list({});
    
    console.log(`Found ${notetakers.data.length} notetakers:`);
    for (const notetaker of notetakers.data) {
      console.log(`- ${notetaker.name} (ID: ${notetaker.id}, State: ${notetaker.state})`);
    }
    
    return notetakers;
  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`Error listing notetakers: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected error in list_notetakers: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Gets media from a Notetaker
 * @param notetakerId The ID of the Notetaker to get media from
 * @returns The media (recording and transcript) from the Notetaker
 */
async function getNotetakerMedia(notetakerId: string): Promise<NylasResponse<NotetakerMedia>> {
  console.log('\n=== Getting Notetaker Media ===');
  
  try {
    const media = await nylas.notetakers.downloadMedia({ notetakerId });
    
    if (media.data.recording) {
      const recording = media.data.recording;
      console.log(`Recording URL: ${recording.url}`);
      console.log(`Recording Name: ${recording.name}`);
      console.log(`Recording Type: ${recording.type}`);
      console.log(`Recording Size: ${recording.size} bytes`);
      
      // Handle both snake_case (API) and camelCase (SDK model) property naming
      const createdAt = 'createdAt' in recording ? recording.createdAt : 
                     'created_at' in recording ? (recording as any).created_at : undefined;
      const expiresAt = 'expiresAt' in recording ? recording.expiresAt : 
                     'expires_at' in recording ? (recording as any).expires_at : undefined;
                     
      if (createdAt) {
        console.log(`Recording Created: ${new Date(createdAt * 1000).toISOString()}`);
      }
      if (expiresAt) {
        console.log(`Recording Expires: ${new Date(expiresAt * 1000).toISOString()}`);
      }
      console.log(`Recording TTL: ${recording.ttl} seconds`);
    }
    
    if (media.data.transcript) {
      const transcript = media.data.transcript;
      console.log(`Transcript URL: ${transcript.url}`);
      console.log(`Transcript Name: ${transcript.name}`);
      console.log(`Transcript Type: ${transcript.type}`);
      console.log(`Transcript Size: ${transcript.size} bytes`);
      
      // Handle both snake_case (API) and camelCase (SDK model) property naming
      const createdAt = 'createdAt' in transcript ? transcript.createdAt : 
                     'created_at' in transcript ? (transcript as any).created_at : undefined;
      const expiresAt = 'expiresAt' in transcript ? transcript.expiresAt : 
                     'expires_at' in transcript ? (transcript as any).expires_at : undefined;
                     
      if (createdAt) {
        console.log(`Transcript Created: ${new Date(createdAt * 1000).toISOString()}`);
      }
      if (expiresAt) {
        console.log(`Transcript Expires: ${new Date(expiresAt * 1000).toISOString()}`);
      }
      console.log(`Transcript TTL: ${transcript.ttl} seconds`);
    }
    
    return media;
  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`Error getting notetaker media: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected error in get_notetaker_media: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Leaves a Notetaker meeting
 * @param notetakerId The ID of the Notetaker to leave
 * @returns A response containing the Notetaker ID and a message
 */
async function leaveNotetaker(notetakerId: string): Promise<NylasResponse<NotetakerLeaveResponse>> {
  console.log('\n=== Leaving Notetaker ===');
  
  try {
    const response = await nylas.notetakers.leave({ notetakerId });
    console.log(`Left Notetaker with ID: ${response.data.id}`);
    console.log(`Message: ${response.data.message}`);
    return response;
  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error(`Error leaving notetaker: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected error in leave_notetaker: ${error.message}`);
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
    
    // Invite a Notetaker to a meeting
    const notetaker = await inviteNotetaker();
    
    // List all Notetakers
    await listNotetakers();
    
    // Get media from the Notetaker (if available)
    if (notetaker.data.state === 'media_available') {
      await getNotetakerMedia(notetaker.data.id);
    } else {
      console.log(`\nNotetaker state is ${notetaker.data.state}, media not available yet.`);
      console.log(`You can check back later when the state is 'media_available'.`);
    }
    
    // Leave the Notetaker meeting
    await leaveNotetaker(notetaker.data.id);
    
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