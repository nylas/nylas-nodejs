const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { parseEnv } = require('node:util');
const {
  configFromFile,
  validateUploadSession,
  createCleanupManifest,
} = require('../../scripts/testLiveE2E.js');

const grantId = '11111111-1111-4111-8111-111111111111';
const bytes = Buffer.alloc(100);
function session() {
  return {
    attachmentId: '22222222-2222-4222-8222-222222222222',
    method: 'PUT',
    grantId,
    filename: 'fixture.bin',
    contentType: 'application/octet-stream',
    size: bytes.length,
    maxSize: 157286400,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    url: 'https://storage.googleapis.com/upload/storage/v1/b/fixture/o?uploadType=resumable&upload_id=fixture-upload-id',
    headers: { 'Content-Type': 'application/octet-stream' },
  };
}

test('live runner refuses missing opt-in before opening any environment file', () => {
  const result = spawnSync(
    process.execPath,
    [
      path.join(__dirname, '../../scripts/testLiveE2E.js'),
      '--test-account-file',
      '/does/not/exist',
    ],
    { encoding: 'utf8' }
  );
  assert.equal(result.status, 1);
  assert.equal(result.stdout, 'FAIL configuration\n');
  assert.equal(result.stderr, '');
});

test(
  'environment parsing treats values as data and rejects an unknown API origin',
  { skip: typeof parseEnv !== 'function' },
  (t) => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'nylas-live-config-test-')
    );
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    const filename = path.join(directory, 'fixture.env');
    const write = (origin) =>
      fs.writeFileSync(
        filename,
        [
          'NYLAS_API_KEY="fixture-key-$(do-not-execute)"',
          `NYLAS_GRANT_ID=${grantId}`,
          'TEST_EMAIL=fixture@example.invalid',
          `NYLAS_API_URI=${origin}`,
        ].join('\n')
      );
    write('https://api.us.nylas.com');
    assert.equal(
      configFromFile(filename).apiKey,
      'fixture-key-$(do-not-execute)'
    );
    write('http://127.0.0.1:9999');
    assert.throws(() => configFromFile(filename));
  }
);

test('presigned upload accepts the documented storage response without authorization', () => {
  const result = validateUploadSession(
    session(),
    { grantId },
    bytes,
    'fixture.bin'
  );
  assert.equal(result.url.hostname, 'storage.googleapis.com');
  assert.equal(result.headers.has('authorization'), false);
  assert.equal(result.headers.get('content-type'), 'application/octet-stream');
});

for (const [name, change] of [
  [
    'unexpected-host',
    (value) => {
      value.url = value.url.replace(
        'storage.googleapis.com',
        'example.invalid'
      );
    },
  ],
  [
    'authorization-header',
    (value) => {
      value.headers.Authorization = 'fixture-only';
    },
  ],
  [
    'redirect-method',
    (value) => {
      value.method = 'POST';
    },
  ],
  [
    'wrong-grant',
    (value) => {
      value.grantId = 'different';
    },
  ],
  [
    'wrong-size',
    (value) => {
      value.size++;
    },
  ],
  [
    'expired-session',
    (value) => {
      value.expiresAt = new Date(0).toISOString();
    },
  ],
]) {
  test(`presigned upload rejects ${name}`, () => {
    const value = session();
    change(value);
    assert.throws(() =>
      validateUploadSession(value, { grantId }, bytes, 'fixture.bin')
    );
  });
}

test('cleanup manifest is private and preserves bounded synthetic recovery state', (t) => {
  const manifest = createCleanupManifest();
  t.after(() => manifest.remove());
  const state = {
    version: 1,
    createdAt: 1,
    drafts: [],
    messages: ['fixture-owned-id'],
    draftSubjects: [],
    messageSubjects: ['nylas-node-e2e-fixture'],
  };
  manifest.write(state);
  assert.deepEqual(
    JSON.parse(fs.readFileSync(manifest.filename, 'utf8')),
    state
  );
  assert.equal(fs.statSync(manifest.filename).mode & 0o777, 0o600);
  assert.equal(
    fs.statSync(path.dirname(manifest.filename)).mode & 0o777,
    0o700
  );
  assert.throws(() => manifest.write({ oversized: 'x'.repeat(65537) }));
});
