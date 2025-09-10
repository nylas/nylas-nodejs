import * as dotenv from 'dotenv';
import Nylas, {
  NylasResponse,
  Message,
  SendMessageRequest,
  CreateAttachmentRequest,
} from 'nylas';
import * as path from 'path';
import * as process from 'process';
import { TestFileManager, FileFormat } from '../utils/attachment-file-manager';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize the Nylas client
const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY || '',
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
});

const grantId: string = process.env.NYLAS_GRANT_ID || '';

/**
 * Flexible attachment sending based on format choice
 */
export async function sendAttachmentsByFormat(
  fileManager: TestFileManager,
  format: FileFormat,
  recipientEmail: string,
  attachmentSize: 'small' | 'large' = 'small',
  isPlaintext: boolean = false
): Promise<NylasResponse<Message>> {
  let attachments: CreateAttachmentRequest[] = [];
  let subject: string;

  if (attachmentSize === 'small') {
    // Send two small attachments
    const files = fileManager.getSmallFiles().slice(0, 2);
    for (const file of files) {
      attachments.push(
        fileManager.createAttachmentRequest(file.filename, format)
      );
    }
    subject = `Nylas SDK - Small Attachments (${format} format)`;
  } else {
    // Send one large attachment
    const file = fileManager.getLargeFiles()[0];
    attachments.push(
      fileManager.createAttachmentRequest(file.filename, format)
    );
    subject = `Nylas SDK - Large Attachment (${format} format)`;
  }

  const requestBody: SendMessageRequest = {
    to: [{ name: 'Test Recipient', email: recipientEmail }],
    subject,
    body: isPlaintext
      ? `Attachment Format Test: ${format}\nThis message demonstrates sending attachments using the ${format} format.\nFiles attached: ${attachments.length}`
      : `
      <h2>Attachment Format Test: ${format}</h2>
      <p>This message demonstrates sending attachments using the ${format} format.</p>
      <p>Files attached: ${attachments.length}</p>
      <ul>
        ${attachments.map((att) => `<li>${att.filename} (${att.size} bytes)</li>`).join('')}
      </ul>
    `,
    attachments,
    isPlaintext,
  };

  // For large files, use a longer timeout (5 minutes)
  const overrides = attachmentSize === 'large' ? { timeout: 300 } : undefined;

  return await nylas.messages.send({
    identifier: grantId,
    requestBody,
    overrides,
  });
}
