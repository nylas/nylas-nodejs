import * as dotenv from 'dotenv';
import * as path from 'path';
import * as process from 'process';
import { TestFileManager } from './utils/attachment-file-manager';

// =============================================================================
// 🎯 NYLAS SDK ATTACHMENT EXAMPLES - Import clean, focused examples
// =============================================================================

// Example 1: File Path Attachments (Most Common & Efficient)
import { sendFilePathAttachments } from './examples/file-path-attachments';

// Example 2: Stream Attachments (For More Control) 
import { sendStreamAttachments } from './examples/stream-attachments';

// Example 3: Buffer Attachments (For Small Files)
import { sendBufferAttachments } from './examples/buffer-attachments';

// Example 4: String Content Attachments (For Dynamic Content)
import { sendStringAttachments } from './examples/string-attachments';

// Flexible format-based attachment sending
import { sendAttachmentsByFormat } from './examples/flexible-attachments';

// =============================================================================
// 📂 File Manager - Manage test files
// =============================================================================
// Available test files in the examples/messages/attachments directory
const testFileManager = new TestFileManager(path.resolve(__dirname, './attachments'), [
  'test-small-26B.txt',
  'test-image-512KB.jpg',
  'test-document-12MB.pdf',
  'test-image-10MB.jpg'
]);


// =============================================================================
// 🛠️ CLI Interface - Start CLI when run directly
// =============================================================================

import { startCli } from './cli-interface';
import type { SendAttachmentsExamples } from './examples';

const sendAttachmentsExamples: SendAttachmentsExamples = {
  sendFilePathAttachments,
  sendStreamAttachments,
  sendBufferAttachments,
  sendStringAttachments,
  sendAttachmentsByFormat
};
const grantId: string = process.env.NYLAS_GRANT_ID || '';

// Check for required environment variables
if (!process.env.NYLAS_API_KEY) {
  throw new Error('NYLAS_API_KEY environment variable is not set');
}
if (!grantId) {
  throw new Error('NYLAS_GRANT_ID environment variable is not set');
}

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Run the CLI
if (require.main === module) {
  startCli(sendAttachmentsExamples, testFileManager, process.env.TEST_EMAIL || '').catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
} 