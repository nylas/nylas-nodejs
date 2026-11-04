const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { parseEnv } = require('node:util');
const { createRequire } = require('node:module');
const { randomUUID, createHash } = require('node:crypto');
const { Readable } = require('node:stream');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const allowedApis = new Set([
  'https://api.us.nylas.com',
  'https://api.eu.nylas.com',
]);
const mimeType = 'application/octet-stream';
let currentCase = 'configuration';
let failed = false;

function check(condition) {
  if (!condition) throw new Error('Live end-to-end check failed.');
}

function statusCode(error) {
  const code = error?.statusCode;
  return Number.isInteger(code) && code >= 100 && code <= 599
    ? code
    : undefined;
}

function report(result, name, error) {
  const status = statusCode(error);
  process.stdout.write(
    `${result} ${name}${status ? ` status=${status}` : ''}\n`
  );
  if (result === 'FAIL') failed = true;
}

async function step(name, action) {
  currentCase = name;
  const result = await action();
  report('PASS', name);
  return result;
}

function configFromFile(filename) {
  const stat = fs.statSync(filename);
  check(stat.isFile() && stat.size > 0 && stat.size <= 65536);
  const values = parseEnv(fs.readFileSync(filename, 'utf8'));
  const config = {
    apiKey: values.NYLAS_API_KEY,
    apiUri: values.NYLAS_API_URI || 'https://api.us.nylas.com',
    grantId: values.NYLAS_GRANT_ID,
    recipient: values.TEST_EMAIL,
  };
  check(
    typeof config.apiKey === 'string' &&
      /^[\x21-\x7e]{8,8192}$/.test(config.apiKey)
  );
  check(allowedApis.has(config.apiUri));
  check(
    typeof config.grantId === 'string' &&
      /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(config.grantId)
  );
  check(
    typeof config.recipient === 'string' &&
      config.recipient.length <= 254 &&
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/.test(
        config.recipient
      )
  );
  return config;
}

function opaqueId(value) {
  check(typeof value === 'string' && /^[\x21-\x7e]{1,2048}$/.test(value));
  return value;
}

function requireSameBytes(actual, expected) {
  check(Buffer.isBuffer(actual) && actual.length === expected.length);
  const digest = (value) => createHash('sha256').update(value).digest('hex');
  check(digest(actual) === digest(expected));
}

function buildInstalledPackage(tempDir) {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const env = { ...process.env };
  for (const name of Object.keys(env)) {
    if (name.startsWith('NYLAS_') || name === 'TEST_EMAIL') delete env[name];
  }
  const run = (args, cwd = root) => {
    const result = spawnSync(npm, args, {
      cwd,
      env,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 180000,
      maxBuffer: 4 * 1024 * 1024,
    });
    check(!result.error && result.status === 0);
    return result.stdout;
  };
  run(['run', 'build']);
  const packed = JSON.parse(
    run(['pack', '--ignore-scripts', '--json', '--pack-destination', tempDir])
  );
  const filename = packed[0]?.filename;
  check(typeof filename === 'string' && path.basename(filename) === filename);
  const consumerDir = path.join(tempDir, 'consumer');
  fs.mkdirSync(consumerDir);
  fs.writeFileSync(
    path.join(consumerDir, 'package.json'),
    JSON.stringify({ name: 'nylas-live-e2e-consumer', private: true })
  );
  run(
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--package-lock=false',
      '--loglevel=error',
      path.join(tempDir, filename),
    ],
    consumerDir
  );
  return createRequire(path.join(consumerDir, 'package.json'))('nylas');
}

const transientStatuses = new Set([404, 409, 429, 500, 502, 503, 504]);
async function poll(read, matches, attempts = 8) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const result = await read();
      if (matches(result)) return result;
    } catch (error) {
      if (!transientStatuses.has(statusCode(error))) throw error;
      if (attempt === attempts - 1) throw error;
    }
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Live consistency deadline exceeded.');
}

function selfRecipient(object, email) {
  return (
    Array.isArray(object?.to) &&
    object.to.some((item) => item.email?.toLowerCase() === email.toLowerCase())
  );
}

async function validateDownload(client, config, object, bytes, filename, name) {
  const attachments = object.attachments;
  if (!Array.isArray(attachments) || !attachments.some((item) => item.id)) {
    report('SKIP', `${name}-attachment-id-unavailable`);
    return;
  }
  const attachment = attachments.find((item) => item.filename === filename);
  check(attachment);
  const attachmentId = opaqueId(attachment.id);
  await step(`${name}-download-integrity`, async () => {
    const download = await poll(
      () =>
        client.attachments.downloadBytes({
          identifier: config.grantId,
          attachmentId,
          queryParams: { messageId: opaqueId(object.id) },
        }),
      (result) => Buffer.isBuffer(result)
    );
    requireSameBytes(download, bytes);
  });
}

function validateUploadSession(session, config, bytes, filename) {
  check(session && typeof session === 'object');
  check(
    typeof session.attachmentId === 'string' &&
      /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(
        session.attachmentId
      )
  );
  check(session.method === 'PUT' && session.grantId === config.grantId);
  check(session.filename === filename && session.contentType === mimeType);
  check(session.size === bytes.length);
  check(
    Number.isSafeInteger(session.maxSize) &&
      session.maxSize >= bytes.length &&
      session.maxSize <= 157286400
  );
  const expiry = Date.parse(session.expiresAt);
  check(expiry > Date.now() && expiry <= Date.now() + 2 * 60 * 60 * 1000);
  check(typeof session.url === 'string' && session.url.length <= 16384);
  check(
    typeof session.expiresAt === 'string' && session.expiresAt.length <= 64
  );
  const url = new URL(session.url);
  check(
    url.protocol === 'https:' &&
      url.hostname === 'storage.googleapis.com' &&
      (url.port === '' || url.port === '443') &&
      url.username === '' &&
      url.password === '' &&
      url.hash === '' &&
      url.pathname.startsWith('/upload/storage/v1/b/') &&
      url.searchParams.get('uploadType') === 'resumable' &&
      (url.searchParams.get('upload_id') || '').length >= 8
  );
  check(
    session.headers &&
      typeof session.headers === 'object' &&
      !Array.isArray(session.headers) &&
      Object.keys(session.headers).length <= 2
  );
  const headers = new Headers();
  for (const [name, value] of Object.entries(session.headers)) {
    check(['content-type', 'content-length'].includes(name.toLowerCase()));
    check(
      typeof value === 'string' && value.length <= 1024 && !/[\r\n]/.test(value)
    );
    headers.set(name, value);
  }
  check(headers.get('content-type') === mimeType);
  check(
    !headers.has('content-length') ||
      headers.get('content-length') === String(bytes.length)
  );
  check(!headers.has('authorization') && !headers.has('cookie'));
  return { url, headers };
}

async function runProviderChecks(Nylas, config, verifyOnly) {
  const client = new Nylas({
    apiKey: config.apiKey,
    apiUri: config.apiUri,
    timeout: 30,
  });
  const grant = await step('test-account-preflight', async () => {
    const result = await client.grants.find({ grantId: config.grantId });
    check(
      result.data?.id === config.grantId && result.data.grantStatus === 'valid'
    );
    check(
      typeof result.data.email === 'string' &&
        result.data.email.toLowerCase() === config.recipient.toLowerCase()
    );
    return result.data;
  });
  if (verifyOnly) return;

  const drafts = new Set();
  const messages = new Set();
  const draftSubjects = new Set();
  const messageSubjects = new Set();
  const createBody = (subject, attachment) => ({
    to: [{ email: config.recipient }],
    subject,
    body: 'Synthetic Node.js SDK end-to-end test. Safe to delete.',
    attachments: [attachment],
  });
  const discover = async (resource, subjects, ids) => {
    for (const subject of subjects) {
      const result = await resource.list({
        identifier: config.grantId,
        queryParams: { subject, anyEmail: [config.recipient], limit: 20 },
      });
      check(Array.isArray(result.data) && !result.nextCursor);
      for (const item of result.data) {
        if (item.subject === subject && selfRecipient(item, config.recipient)) {
          ids.add(opaqueId(item.id));
        }
      }
    }
  };
  const cleanup = async () => {
    for (const [name, resource, ids, subjects, idKey] of [
      ['draft', client.drafts, drafts, draftSubjects, 'draftId'],
      ['message', client.messages, messages, messageSubjects, 'messageId'],
    ]) {
      if (!ids.size && !subjects.size) continue;
      // Revisit exact synthetic subjects to catch a late self-delivery or an
      // ambiguous POST outcome. No unrelated message is eligible for deletion.
      for (let round = 0; round < 3; round++) {
        try {
          await discover(resource, subjects, ids);
        } catch (error) {
          report('FAIL', `cleanup-${name}-discovery`, error);
        }
        for (const id of Array.from(ids)) {
          try {
            await poll(
              async () => {
                try {
                  await resource.destroy({
                    identifier: config.grantId,
                    [idKey]: id,
                  });
                } catch (error) {
                  if (![404, 410].includes(statusCode(error))) throw error;
                }
                return true;
              },
              Boolean,
              3
            );
            ids.delete(id);
          } catch (error) {
            report('FAIL', `cleanup-${name}`, error);
          }
        }
        if (round < 2 && subjects.size) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      try {
        await poll(
          async () => {
            const remaining = new Set();
            await discover(resource, subjects, remaining);
            return !remaining.size && !ids.size;
          },
          Boolean,
          5
        );
        report('PASS', `cleanup-${name}-confirmed`);
      } catch (error) {
        report('FAIL', `cleanup-${name}-confirmed`, error);
      }
    }
  };

  try {
    for (const [index, kind] of ['buffer', 'base64', 'stream'].entries()) {
      const subject = `nylas-node-e2e-${randomUUID()}`;
      const filename = `sdk-e2e-${index}.bin`;
      const bytes = Buffer.alloc(Math.ceil(2.4 * 1024 * 1024), 0x60 + index);
      const attachment = (form) => ({
        filename,
        contentType: mimeType,
        content:
          form === 'buffer'
            ? bytes
            : form === 'base64'
              ? bytes.toString('base64')
              : Readable.from([bytes]),
      });
      draftSubjects.add(subject);
      const draftId = await step(`draft-${kind}-create-multipart`, async () => {
        const result = await client.drafts.create({
          identifier: config.grantId,
          requestBody: createBody(subject, attachment(kind)),
        });
        const id = opaqueId(result.data?.id);
        drafts.add(id);
        return id;
      });
      const findDraft = () =>
        client.drafts.find({ identifier: config.grantId, draftId });
      const found = await step(`draft-${kind}-find`, () =>
        poll(findDraft, (result) => result.data?.subject === subject)
      );
      await validateDownload(
        client,
        config,
        found.data,
        bytes,
        filename,
        `draft-${kind}`
      );
      await step(`draft-${kind}-any-email-filter`, () =>
        poll(
          () =>
            client.drafts.list({
              identifier: config.grantId,
              queryParams: {
                subject,
                anyEmail: [
                  config.recipient,
                  `absent-${randomUUID()}@example.invalid`,
                ],
                limit: 20,
              },
            }),
          (result) =>
            result.data?.some(
              (item) => item.id === draftId && item.subject === subject
            )
        )
      );
      const updatedSubject = `${subject}-updated`;
      draftSubjects.add(updatedSubject);
      await step(`draft-${kind}-update-multipart`, async () => {
        const result = await client.drafts.update({
          identifier: config.grantId,
          draftId,
          requestBody: {
            subject: updatedSubject,
            attachments: [attachment(['base64', 'stream', 'buffer'][index])],
          },
        });
        drafts.add(opaqueId(result.data?.id));
      });
      const updated = await step(`draft-${kind}-find-updated`, () =>
        poll(findDraft, (result) => result.data?.subject === updatedSubject)
      );
      await validateDownload(
        client,
        config,
        updated.data,
        bytes,
        filename,
        `draft-${kind}-updated`
      );
      await step(`draft-${kind}-delete`, () =>
        client.drafts.destroy({ identifier: config.grantId, draftId })
      );
      await step(`draft-${kind}-delete-visible`, () =>
        poll(async () => {
          try {
            await findDraft();
            return false;
          } catch (error) {
            if ([404, 410].includes(statusCode(error))) return true;
            throw error;
          }
        }, Boolean)
      );
      drafts.delete(draftId);
      draftSubjects.delete(subject);
      draftSubjects.delete(updatedSubject);
    }

    for (const [index, kind] of ['buffer', 'base64', 'stream'].entries()) {
      const subject = `nylas-node-e2e-${randomUUID()}`;
      const filename = `sdk-send-e2e-${index}.bin`;
      const bytes = Buffer.alloc(Math.ceil(2.4 * 1024 * 1024), 0x70 + index);
      const content =
        kind === 'buffer'
          ? bytes
          : kind === 'base64'
            ? bytes.toString('base64')
            : Readable.from([bytes]);
      messageSubjects.add(subject);
      const messageId = await step(
        `message-${kind}-send-once-to-self`,
        async () => {
          // Never retry a send POST, even when its outcome is ambiguous.
          const result = await client.messages.send({
            identifier: config.grantId,
            requestBody: createBody(subject, {
              filename,
              contentType: mimeType,
              content,
            }),
          });
          const id = opaqueId(result.data?.id);
          messages.add(id);
          return id;
        }
      );
      const sent = await step(`message-${kind}-attachment-visible`, () =>
        poll(
          () => client.messages.find({ identifier: config.grantId, messageId }),
          (result) =>
            result.data?.subject === subject &&
            selfRecipient(result.data, config.recipient) &&
            result.data.attachments?.some(
              (item) => item.filename === filename && item.id
            ),
          12
        )
      );
      await validateDownload(
        client,
        config,
        sent.data,
        bytes,
        filename,
        `message-${kind}`
      );
      await step(`message-${kind}-self-filter-visible`, () =>
        poll(
          async () => {
            const result = await client.messages.list({
              identifier: config.grantId,
              queryParams: { subject, anyEmail: [config.recipient], limit: 20 },
            });
            for (const item of result.data || []) {
              if (
                item.subject === subject &&
                selfRecipient(item, config.recipient)
              ) {
                messages.add(opaqueId(item.id));
              }
            }
            return result;
          },
          (result) =>
            result.data?.some(
              (item) =>
                item.subject === subject &&
                selfRecipient(item, config.recipient)
            ),
          12
        )
      );
    }

    if (grant.provider !== 'microsoft') {
      report('SKIP', 'upload-reference-provider-unavailable');
    } else {
      const subject = `nylas-node-e2e-${randomUUID()}`;
      const filename = 'sdk-upload-session-e2e.bin';
      const bytes = Buffer.alloc(1024 * 1024, 0x75);
      const session = await step('upload-session-create', async () => {
        const result = await client.attachments.createUploadSession({
          identifier: config.grantId,
          requestBody: { filename, contentType: mimeType, size: bytes.length },
        });
        validateUploadSession(result.data, config, bytes, filename);
        return result.data;
      });
      await step('upload-presigned-put-without-auth', async () => {
        const { url, headers } = validateUploadSession(
          session,
          config,
          bytes,
          filename
        );
        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body: bytes,
          redirect: 'error',
          signal: AbortSignal.timeout(30000),
        });
        if (!response.ok) {
          const error = new Error('Upload failed.');
          error.statusCode = response.status;
          await response.body?.cancel();
          throw error;
        }
        await response.body?.cancel();
      });
      await step('upload-session-complete', async () => {
        const result = await client.attachments.completeUploadSession({
          identifier: config.grantId,
          attachmentId: session.attachmentId,
        });
        check(
          result.data?.attachmentId === session.attachmentId &&
            result.data.grantId === config.grantId &&
            result.data.status === 'ready'
        );
      });
      messageSubjects.add(subject);
      const messageId = await step(
        'upload-reference-send-once-to-self',
        async () => {
          // A send failure is never retried: its outcome may be ambiguous.
          const result = await client.messages.send({
            identifier: config.grantId,
            requestBody: createBody(subject, { id: session.attachmentId }),
          });
          const id = opaqueId(result.data?.id);
          messages.add(id);
          return id;
        }
      );
      const sent = await step('upload-reference-message-visible', () =>
        poll(
          () => client.messages.find({ identifier: config.grantId, messageId }),
          (result) =>
            result.data?.subject === subject &&
            result.data.attachments?.some(
              (item) => item.filename === filename && item.id
            )
        )
      );
      await validateDownload(
        client,
        config,
        sent.data,
        bytes,
        filename,
        'upload-reference-message'
      );
      await step('self-message-list-visible', () =>
        poll(
          async () => {
            const result = await client.messages.list({
              identifier: config.grantId,
              queryParams: { subject, anyEmail: [config.recipient], limit: 20 },
            });
            for (const item of result.data || []) {
              if (
                item.subject === subject &&
                selfRecipient(item, config.recipient)
              ) {
                messages.add(opaqueId(item.id));
              }
            }
            return result;
          },
          (result) =>
            result.data?.some(
              (item) =>
                item.subject === subject &&
                item.from?.some(
                  (sender) =>
                    sender.email?.toLowerCase() ===
                    config.recipient.toLowerCase()
                )
            )
        )
      );
    }
    report('SKIP', 'transactional-domain-not-configured');
  } finally {
    await cleanup();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const envPosition = args.indexOf('--test-account-file');
  const verifyOnly = args.includes('--verify-only');
  check(
    envPosition >= 0 &&
      typeof args[envPosition + 1] === 'string' &&
      (verifyOnly || args.includes('--allow-test-account-writes')) &&
      typeof parseEnv === 'function'
  );
  const config = configFromFile(path.resolve(args[envPosition + 1]));
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nylas-live-e2e-'));
  try {
    const Nylas = await step('fresh-packed-artifact-installed', () =>
      buildInstalledPackage(tempDir)
    );
    await runProviderChecks(Nylas, config, verifyOnly);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

if (require.main === module) {
  main()
    .catch((error) => report('FAIL', currentCase, error))
    .finally(() => {
      if (failed) process.exitCode = 1;
    });
}

module.exports = { configFromFile, validateUploadSession };
