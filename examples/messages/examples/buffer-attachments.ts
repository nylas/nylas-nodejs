import * as dotenv from 'dotenv';
  import Nylas, { NylasResponse, Message, SendMessageRequest } from 'nylas';
import * as path from 'path';
import * as process from 'process';
import { TestFileManager } from '../utils/attachment-file-manager';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize the Nylas client
const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY || '',
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com'
});

const grantId: string = process.env.NYLAS_GRANT_ID || '';

/**
 * Example 3: Buffer Attachments (For Small Files)
 * 
 * Loads the entire file into memory as a Buffer.
 * Good for small files or when you need to process content.
 */
export async function sendBufferAttachments(fileManager: TestFileManager, recipientEmail: string, large: boolean = false): Promise<NylasResponse<Message>> {
  console.log('💾 Sending attachments using buffers...');
  
  let sizeDescription;
  
  let files;
  if (large) {
    // Send one large attachment
    files = [fileManager.getLargeFiles()[0]];
    sizeDescription = 'large';
  } else {
    // Send multiple small attachments
    files = fileManager.getSmallFiles().slice(0, 2);
    sizeDescription = 'small';
  }

  // Create attachment using a buffer and use file info for name/type
  const bufferAttachments = files.map(file => ({
    filename: file.filename,
    contentType: file.contentType,
    content: file.asBuffer(),
    size: file.size,
  }));
  
  const requestBody: SendMessageRequest = {
    to: [{ name: 'Test Recipient', email: recipientEmail }],
    subject: 'Nylas SDK - Buffer Attachments',
    body: `
      <h2>Buffer Attachments Example</h2>
      <p>This demonstrates sending attachments using Node.js Buffer objects.</p>
      <p>Good for small files when you need the content in memory.</p>
    `,
    attachments: bufferAttachments
  };
  
  // For large files, use a longer timeout (5 minutes)
  const overrides = large ? { timeout: 300 } : undefined;
  
  return await nylas.messages.send({
    identifier: grantId,
    requestBody,
    overrides
  });
} 