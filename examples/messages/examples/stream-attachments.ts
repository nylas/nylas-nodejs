import * as dotenv from 'dotenv';
import Nylas, {
  NylasResponse,
  Message,
  SendMessageRequest,
  CreateAttachmentRequest,
} from 'nylas';
import * as path from 'path';
import * as process from 'process';
import { TestFileManager } from '../utils/attachment-file-manager';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize the Nylas client
const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY || '',
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
});

const grantId: string = process.env.NYLAS_GRANT_ID || '';

/**
 * Example 2: Stream Attachments (For More Control)
 *
 * Useful when you're working with streams from other sources
 * or need more control over the stream processing.
 */
export async function sendStreamAttachments(
  fileManager: TestFileManager,
  recipientEmail: string,
  large: boolean = false,
  isPlaintext: boolean = false
): Promise<NylasResponse<Message>> {
  console.log('🌊 Sending attachments using streams...');

  let attachments: CreateAttachmentRequest[] = [];
  let sizeDescription;

  if (large) {
    // Send one large attachment
    const file = fileManager.getLargeFiles()[0];
    attachments = [
      {
        filename: file.filename,
        contentType: file.contentType,
        content: file.asStream(),
        size: file.size,
      },
    ];
    sizeDescription = 'large';
  } else {
    // Send multiple small attachments
    const files = fileManager.getSmallFiles().slice(0, 2);
    attachments = files.map((file) => ({
      filename: file.filename,
      contentType: file.contentType,
      content: file.asStream(),
      size: file.size,
    }));
    sizeDescription = 'small';
  }

  const requestBody: SendMessageRequest = {
    to: [{ name: 'Test Recipient', email: recipientEmail }],
    subject: `Nylas SDK - Stream Attachments (${sizeDescription})`,
    body: isPlaintext
      ? `Stream Attachments Example\nThis demonstrates sending attachments using readable streams.\nAttachment size: ${sizeDescription} (${attachments.length} file${attachments.length > 1 ? 's' : ''})`
      : `
      <h2>Stream Attachments Example</h2>
      <p>This demonstrates sending attachments using readable streams.</p>
      <p>Useful when you have streams from other sources.</p>
      <p>Attachment size: ${sizeDescription} (${attachments.length} file${attachments.length > 1 ? 's' : ''})</p>
    `,
    attachments,
    isPlaintext,
  };

  // For large files, use a longer timeout (5 minutes)
  const overrides = large ? { timeout: 300 } : undefined;

  return await nylas.messages.send({
    identifier: grantId,
    requestBody,
    overrides,
  });
}
