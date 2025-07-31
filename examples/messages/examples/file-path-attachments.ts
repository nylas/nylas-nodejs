import * as dotenv from 'dotenv';
import Nylas, { NylasResponse, Message, SendMessageRequest } from 'nylas';
import * as path from 'path';
import * as process from 'process';
import { createFileRequestBuilder, TestFileManager } from '../utils/attachment-file-manager';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize the Nylas client
const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY || '',
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com'
});

const grantId: string = process.env.NYLAS_GRANT_ID || '';

/**
 * Example 1: File Path Attachments (Most Common & Efficient)
 * 
 * This is the recommended approach for most use cases.
 * Uses streams internally for memory efficiency.
 */
export async function sendFilePathAttachments(fileManager: TestFileManager, recipientEmail: string, large: boolean = false): Promise<NylasResponse<Message>> {
  console.log('📁 Sending attachments using file paths...');
  
  let attachments;
  let sizeDescription;
  
  if (large) {
    // Send one large attachment
    const file = fileManager.getLargeFiles()[0];
    attachments = [createFileRequestBuilder(file.path)];
    sizeDescription = 'large';
  } else {
    // Send multiple small attachments
    const files = fileManager.getSmallFiles().slice(0, 2);
    attachments = files.map(file => createFileRequestBuilder(file.path));
    sizeDescription = 'small';
  }

  const requestBody: SendMessageRequest = {
    to: [{ name: 'Test Recipient', email: recipientEmail }],
    subject: `Nylas SDK - File Path Attachments (${sizeDescription})`,
    body: `
      <h2>File Path Attachments Example</h2>
      <p>This demonstrates the most common way to send attachments using file paths.</p>
      <p>The SDK uses streams internally for memory efficiency.</p>
      <p>Attachment size: ${sizeDescription} (${attachments.length} file${attachments.length > 1 ? 's' : ''})</p>
    `,
    attachments
  };

  // For large files, use a longer timeout (5 minutes)
  const overrides = large ? { timeout: 300 } : undefined;

  return await nylas.messages.send({
    identifier: grantId,
    requestBody,
    overrides
  });
} 