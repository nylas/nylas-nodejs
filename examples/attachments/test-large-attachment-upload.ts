/**
 * End-to-end test for the new large-attachment upload session API.
 *
 * Exercises the large-attachment upload session methods on `nylas.attachments`:
 *   1. createUploadSession
 *   2. completeUploadSession
 * plus the surrounding flow (PUT to pre-signed URL, send message referencing
 * the uploaded attachment).
 *
 * USAGE
 * -----
 *   1. From the SDK root, build the SDK:
 *        npm install && npm run build
 *   2. From `examples/`, install deps:
 *        npm install
 *   3. Copy `.env.example` to `.env` and fill in:
 *        NYLAS_API_KEY     — your Nylas API key
 *        NYLAS_GRANT_ID    — grant ID to act on
 *        TEST_EMAIL        — recipient for the final send step
 *        NYLAS_API_URI     — optional, defaults to https://api.us.nylas.com
 *   4. Run:
 *        npx ts-node attachments/test-large-attachment-upload.ts
 *
 * The script exits with code 0 on success or 1 on any step failure, and
 * prints a PASS/FAIL line per step.
 */

import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as process from 'process';
import Nylas from 'nylas';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.NYLAS_API_KEY || '';
const grantId = process.env.NYLAS_GRANT_ID || '';
const testEmail = process.env.TEST_EMAIL || '';
const apiUri = process.env.NYLAS_API_URI || 'https://api.us.nylas.com';

if (!apiKey) {
  console.error('FAIL: NYLAS_API_KEY environment variable is not set');
  process.exit(1);
}
if (!grantId) {
  console.error('FAIL: NYLAS_GRANT_ID environment variable is not set');
  process.exit(1);
}
if (!testEmail) {
  console.error('FAIL: TEST_EMAIL environment variable is not set');
  process.exit(1);
}

const nylas = new Nylas({ apiKey, apiUri });

const TEST_FILENAME = 'test-upload.bin';
const TEST_CONTENT_TYPE = 'application/octet-stream';
const TEST_SIZE = 50 * 1024;
const fileBuffer = crypto.randomBytes(TEST_SIZE);

let failures = 0;
function pass(label: string, detail?: unknown): void {
  if (detail !== undefined) {
    console.log(`PASS: ${label}`, detail);
  } else {
    console.log(`PASS: ${label}`);
  }
}
function fail(label: string, detail?: unknown): void {
  failures += 1;
  if (detail !== undefined) {
    console.error(`FAIL: ${label}`, detail);
  } else {
    console.error(`FAIL: ${label}`);
  }
}

async function main(): Promise<void> {
  console.log('--- Nylas large-attachment upload session test ---');
  console.log(`grant=${grantId}  api=${apiUri}  size=${TEST_SIZE}B`);

  // -------------------------------------------------------------------------
  // Step 1: createUploadSession
  // -------------------------------------------------------------------------
  console.log('\n[1] createUploadSession');
  const createResponse = await nylas.attachments.createUploadSession({
    identifier: grantId,
    requestBody: {
      filename: TEST_FILENAME,
      contentType: TEST_CONTENT_TYPE,
      size: TEST_SIZE,
    },
  });
  const session = createResponse.data;

  if (!session?.attachmentId) {
    fail('createUploadSession returned no attachmentId', createResponse);
    process.exit(1);
  }
  if (!session.url || !session.method) {
    fail('createUploadSession missing url/method', session);
    process.exit(1);
  }
  if (session.filename !== TEST_FILENAME) {
    fail(
      `createUploadSession filename mismatch (got ${session.filename})`,
      session
    );
  }
  if (session.contentType !== TEST_CONTENT_TYPE) {
    fail(
      `createUploadSession contentType mismatch (got ${session.contentType})`,
      session
    );
  }
  pass('createUploadSession returned session', {
    attachmentId: session.attachmentId,
    method: session.method,
    expiresAt: session.expiresAt,
    maxSize: session.maxSize,
  });

  const attachmentId = session.attachmentId;

  // -------------------------------------------------------------------------
  // Step 2: PUT bytes to the pre-signed URL (outside the SDK)
  // -------------------------------------------------------------------------
  console.log('\n[2] PUT file bytes to pre-signed URL');
  const putHeaders: Record<string, string> = {
    ...(session.headers || {}),
    'Content-Length': String(TEST_SIZE),
  };
  const putRes = await fetch(session.url, {
    method: session.method || 'PUT',
    headers: putHeaders,
    body: fileBuffer,
    // @ts-expect-error  Node 18+ undici fetch requires `duplex` for streamed bodies
    duplex: 'half',
  });
  if (!putRes.ok) {
    const body = await putRes.text().catch(() => '');
    fail(`PUT failed ${putRes.status} ${putRes.statusText}`, body);
    process.exit(1);
  }
  pass(`PUT succeeded (HTTP ${putRes.status})`);

  // -------------------------------------------------------------------------
  // Step 3: completeUploadSession
  // -------------------------------------------------------------------------
  console.log('\n[3] completeUploadSession');
  const completeResponse = await nylas.attachments.completeUploadSession({
    identifier: grantId,
    attachmentId,
  });
  const complete = completeResponse.data;
  if (complete?.attachmentId !== attachmentId) {
    fail(
      `completeUploadSession attachmentId mismatch (got ${complete?.attachmentId})`,
      completeResponse
    );
  }
  if (!complete?.status) {
    fail('completeUploadSession missing status', completeResponse);
  }
  pass('completeUploadSession returned', {
    attachmentId: complete?.attachmentId,
    status: complete?.status,
  });

  // -------------------------------------------------------------------------
  // Step 4: Send a message referencing the uploaded attachment
  // -------------------------------------------------------------------------
  console.log('\n[4] messages.send with attachmentId');
  try {
    const sendResponse = await nylas.messages.send({
      identifier: grantId,
      requestBody: {
        to: [{ email: testEmail }],
        subject: 'Nylas SDK — Large Attachment Upload Test',
        body:
          'This message was sent by the Nylas Node.js SDK large-attachment ' +
          'upload session test script. The attached file was uploaded out-of-' +
          'band to a pre-signed URL and referenced here by attachment ID.',
        // The SDK's CreateAttachmentRequest type requires `content`/`filename`,
        // but the API accepts a bare `{ id: <attachmentId> }` reference for
        // attachments uploaded via the upload-session flow.
        attachments: [{ id: attachmentId } as any],
      } as any,
    });
    pass('messages.send succeeded', {
      messageId: sendResponse.data?.id,
      subject: sendResponse.data?.subject,
    });
  } catch (err) {
    fail('messages.send threw', err);
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log('\n--- Summary ---');
  if (failures === 0) {
    console.log('All steps passed.');
    process.exit(0);
  }
  console.error(`${failures} step(s) failed.`);
  process.exit(1);
}

main().catch((err) => {
  console.error('FAIL: unhandled error', err);
  process.exit(1);
});
