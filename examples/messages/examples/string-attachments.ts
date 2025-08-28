import * as dotenv from 'dotenv';
import Nylas, { NylasResponse, Message, SendMessageRequest, CreateAttachmentRequest } from 'nylas';
import { TestFileManager } from '../utils/attachment-file-manager';
import * as path from 'path';
import * as process from 'process';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize the Nylas client
const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY || '',
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com'
});

const grantId: string = process.env.NYLAS_GRANT_ID || '';

/**
 * Example 4: String Content Attachments (Base64 Encoded Files)
 * 
 * Perfect for sending existing files as base64 encoded strings.
 * This example pulls the same files used by other examples but encodes them as base64 strings.
 */
export async function sendStringAttachments(fileManager: TestFileManager, recipientEmail: string, large: boolean = false, isPlaintext: boolean = false): Promise<NylasResponse<Message>> {
  console.log('📝 Sending base64 encoded file attachments as strings...');
  
  let stringAttachments: CreateAttachmentRequest[] = [];
  let sizeDescription = '';
  
  if (large) {
    // Send one large attachment - use the large PDF file
    const largeFiles = fileManager.getLargeFiles();
    if (largeFiles.length > 0) {
      const file = largeFiles.find(f => f.filename.includes('pdf')) || largeFiles[0];
      const fileBuffer = file.asBuffer();
      const base64Content = fileBuffer.toString('base64');
      
      stringAttachments = [{
        filename: file.filename,
        contentType: file.contentType,
        content: base64Content,
        size: Buffer.byteLength(base64Content, 'utf8'),
      }];
      sizeDescription = 'large';
    } else {
      throw new Error('No large files available for testing');
    }
  } else {
    // Send multiple small attachments - use text file and image file
    const smallFiles = fileManager.getSmallFiles();
    if (smallFiles.length >= 2) {
      // Get the text file and image file
      const textFile = smallFiles.find(f => f.filename.includes('.txt')) || smallFiles[0];
      const imageFile = smallFiles.find(f => f.filename.includes('.jpg')) || smallFiles[1];
      
      const files = [textFile, imageFile];
      
      stringAttachments = files.map(file => {
        const fileBuffer = file.asBuffer();
        const base64Content = fileBuffer.toString('base64');
        
        return {
          filename: file.filename,
          contentType: file.contentType,
          content: base64Content,
          size: Buffer.byteLength(base64Content, 'utf8'),
        };
      });
      sizeDescription = 'small';
    } else {
      throw new Error('Not enough small files available for testing');
    }
  }
  
  const requestBody: SendMessageRequest = {
    to: [{ name: 'Test Recipient', email: recipientEmail }],
    subject: `Nylas SDK - Base64 String Attachments (${sizeDescription})`,
    body: isPlaintext
      ? `Base64 String Attachments Example\nThis demonstrates sending existing files as base64 encoded strings.\nAttachment size: ${sizeDescription} (${stringAttachments.length} file${stringAttachments.length > 1 ? 's' : ''})`
      : `
      <h2>Base64 String Attachments Example</h2>
      <p>This demonstrates sending existing files as base64 encoded strings.</p>
      <p>Files are converted from the same test files used in other examples.</p>
      <p>Attachment size: ${sizeDescription} (${stringAttachments.length} file${stringAttachments.length > 1 ? 's' : ''})</p>
      <ul>
        ${stringAttachments.map(att => `<li>${att.filename} (${att.size} bytes base64 encoded)</li>`).join('')}
      </ul>
    `,
    attachments: stringAttachments,
    isPlaintext
  };
  
  // For large files, use a longer timeout (5 minutes)
  const overrides = large ? { timeout: 300 } : undefined;
  
  return await nylas.messages.send({
    identifier: grantId,
    requestBody,
    overrides
  });
} 