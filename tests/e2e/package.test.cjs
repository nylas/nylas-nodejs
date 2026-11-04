const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { createRequire } = require('node:module');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const ts = require('typescript');

const consumerDir = process.env.NYLAS_E2E_CONSUMER_DIR;
assert(consumerDir, 'Run this suite with npm run test:e2e');
const consumerRequire = createRequire(path.join(consumerDir, 'package.json'));
const Nylas = consumerRequire('nylas');

test('installed SDK reads filename-free attachment metadata over HTTP', async (t) => {
  const requests = [];
  const attachment = {
    id: 'mime-part',
    grant_id: 'grant-id',
    content_type: 'message/delivery-status',
    size: 10,
  };
  const server = http.createServer((req, res) => {
    requests.push({ method: req.method, url: req.url });
    res.setHeader('content-type', 'application/json');
    if (req.url.startsWith('/v3/grants/grant-id/attachments/mime-part?')) {
      res.end(
        JSON.stringify({ request_id: 'attachment-request', data: attachment })
      );
    } else if (req.url === '/v3/grants/grant-id/messages/message-id') {
      res.end(
        JSON.stringify({
          request_id: 'message-request',
          data: { id: 'message-id', attachments: [attachment] },
        })
      );
    } else {
      res.statusCode = 404;
      res.end(
        JSON.stringify({ error: { type: 'not_found', message: 'Not found.' } })
      );
    }
  });
  t.after(() => {
    server.closeAllConnections();
    return new Promise((resolve) => server.close(resolve));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const client = new Nylas({
    apiKey: 'e2e-key',
    apiUri: `http://127.0.0.1:${server.address().port}`,
    timeout: 5,
  });

  const metadata = await client.attachments.find({
    identifier: 'grant-id',
    attachmentId: 'mime-part',
    queryParams: { messageId: 'message-id' },
  });
  assert.equal(metadata.requestId, 'attachment-request');
  assert.deepEqual(metadata.data, {
    id: 'mime-part',
    grantId: 'grant-id',
    contentType: 'message/delivery-status',
    size: 10,
  });
  assert.equal(Object.hasOwn(metadata.data, 'filename'), false);

  const message = await client.messages.find({
    identifier: 'grant-id',
    messageId: 'message-id',
  });
  assert.deepEqual(message.data.attachments, [metadata.data]);
  assert.deepEqual(requests, [
    {
      method: 'GET',
      url: '/v3/grants/grant-id/attachments/mime-part?message_id=message-id',
    },
    { method: 'GET', url: '/v3/grants/grant-id/messages/message-id' },
  ]);
});

test('installed package compiles and runs CommonJS and ESM consumers', () => {
  const common = `import assert from 'node:assert/strict';
import Nylas, {
  Attachment,
  AttachmentReference,
  SendAttachmentRequest,
  CreateAttachmentRequest,
  NylasApiError,
  NylasOAuthError,
  NylasSdkTimeoutError,
  WhenType,
} from 'nylas';
const client: Nylas = new Nylas({ apiKey: 'e2e-key' });
const attachment: Attachment = {
  id: 'mime-part', grantId: 'grant-id', contentType: 'message/delivery-status',
};
const reference: AttachmentReference = { id: 'upload-id' };
const sendAttachment: SendAttachmentRequest = reference;
void sendAttachment;
const filename: string | undefined = attachment.filename;
assert.equal(filename, undefined);
assert.equal(typeof client.messages.find, 'function');
assert.equal(typeof NylasOAuthError, 'function');
assert.equal(typeof NylasSdkTimeoutError, 'function');
assert.equal(typeof WhenType, 'object');
const error: NylasApiError = new NylasApiError({
  requestId: 'request-id', error: { type: 'e2e', message: 'Example.' },
});
assert(error instanceof NylasApiError);
// @ts-expect-error Outgoing attachment content still requires a filename.
const invalidUpload: CreateAttachmentRequest = { contentType: 'text/plain', content: 'eA==' };
void invalidUpload;
`;
  const files = [
    path.join(consumerDir, 'consumer.cts'),
    path.join(consumerDir, 'consumer.mts'),
  ];
  fs.writeFileSync(
    files[0],
    `${common}\nimport NylasConstructor = require('nylas');
const classicClient: NylasConstructor = new NylasConstructor({ apiKey: 'e2e-key' });
const defaultClient: NylasConstructor = new NylasConstructor.default({ apiKey: 'e2e-key' });
assert(classicClient instanceof NylasConstructor);
assert(defaultClient instanceof NylasConstructor);
assert.equal(NylasConstructor.NylasApiError, NylasApiError);
`
  );
  fs.writeFileSync(files[1], common);

  for (const [module, moduleResolution] of [
    [ts.ModuleKind.Node16, ts.ModuleResolutionKind.Node16],
    [ts.ModuleKind.NodeNext, ts.ModuleResolutionKind.NodeNext],
    [ts.ModuleKind.Preserve, ts.ModuleResolutionKind.Bundler],
  ]) {
    const emit = module === ts.ModuleKind.NodeNext;
    const program = ts.createProgram(files, {
      module,
      moduleResolution,
      target: ts.ScriptTarget.ES2022,
      strict: true,
      noEmit: !emit,
      outDir: path.join(consumerDir, 'compiled'),
      esModuleInterop: true,
      // formdata-node has an existing Node16 transitive declaration conflict.
      skipLibCheck: moduleResolution === ts.ModuleResolutionKind.Node16,
      types: ['node'],
      typeRoots: [path.join(__dirname, '..', '..', 'node_modules', '@types')],
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    assert.equal(
      diagnostics.length,
      0,
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (filename) => filename,
        getCurrentDirectory: () => consumerDir,
        getNewLine: () => '\n',
      })
    );
    if (emit) {
      assert.equal(program.emit().emitSkipped, false);
    }
  }

  for (const filename of ['consumer.cjs', 'consumer.mjs']) {
    const result = spawnSync(
      process.execPath,
      [path.join(consumerDir, 'compiled', filename)],
      { cwd: consumerDir, encoding: 'utf8' }
    );
    assert.equal(result.status, 0, result.stderr);
  }
});
