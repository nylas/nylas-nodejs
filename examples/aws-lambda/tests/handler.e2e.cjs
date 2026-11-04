const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const esbuild = require('esbuild');

const temporaryDirectory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'nylas-lambda-e2e-')
);
const handlerPath = path.join(temporaryDirectory, 'handler.cjs');
esbuild.buildSync({
  entryPoints: [path.join(__dirname, '../src/handler.ts')],
  outfile: handlerPath,
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  logLevel: 'silent',
});
test.after(() =>
  fs.rmSync(temporaryDirectory, { recursive: true, force: true })
);

function runHandler(event, apiUri = 'http://127.0.0.1:1', envOverrides = {}) {
  return new Promise((resolve, reject) => {
    const script = `
      const { handler } = require(process.argv[1]);
      handler(JSON.parse(process.argv[2])).then((result) => {
        process.stdout.write('\\nHANDLER_RESULT ' + JSON.stringify(result) + '\\n');
      }).catch(() => { process.exitCode = 1; });
    `;
    const child = spawn(
      process.execPath,
      ['-e', script, handlerPath, JSON.stringify(event)],
      {
        env: {
          ...process.env,
          NYLAS_API_KEY: 'synthetic-loopback-key',
          NYLAS_GRANT_ID: 'synthetic-loopback-grant',
          NYLAS_API_URI: apiUri,
          ...envOverrides,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    const timer = setTimeout(() => child.kill(), 5000);
    child.on('error', reject);
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0)
        return reject(new Error('Bundled handler process failed.'));
      const line = stdout
        .split('\n')
        .find((entry) => entry.startsWith('HANDLER_RESULT '));
      if (!line)
        return reject(new Error('Bundled handler did not return a result.'));
      resolve({
        result: JSON.parse(line.slice('HANDLER_RESULT '.length)),
        stdout,
        stderr,
      });
    });
  });
}

function assertRedacted(output, sentinels) {
  for (const sentinel of sentinels) {
    assert.ok(
      !output.stdout.includes(sentinel),
      'Response or stdout exposed sensitive fixture content.'
    );
    assert.ok(
      !output.stderr.includes(sentinel),
      'Stderr exposed sensitive fixture content.'
    );
  }
  assert.ok(!output.result.body.includes('stack'));
  assert.ok(!output.result.body.includes('details'));
  assert.ok(!output.result.body.includes(temporaryDirectory));
}

const sendEvent = (body, contentType) => ({
  httpMethod: 'POST',
  path: '/send-attachment',
  headers: { 'Content-Type': contentType },
  body,
  isBase64Encoded: false,
});

function multipart(fields) {
  const boundary = 'handler-e2e-boundary';
  const parts = fields.map(
    ([name, value]) =>
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
  );
  parts.push(
    `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="private-filename-sentinel.txt"\r\nContent-Type: text/plain\r\n\r\nprivate-attachment-sentinel\r\n`
  );
  parts.push(`--${boundary}--\r\n`);
  return sendEvent(parts.join(''), `multipart/form-data; boundary=${boundary}`);
}

test('malformed multipart bodies and headers stay out of responses and logs', async () => {
  const output = await runHandler(
    sendEvent(
      'private-body-sentinel',
      'multipart/form-data; private-header-sentinel'
    )
  );
  assert.equal(output.result.statusCode, 400);
  assert.deepEqual(JSON.parse(output.result.body), {
    error: 'Failed to parse form data',
  });
  assertRedacted(output, ['private-body-sentinel', 'private-header-sentinel']);
});

test('unexpected handler failures return a generic response without a stack', async () => {
  const output = await runHandler(null);
  assert.equal(output.result.statusCode, 500);
  assert.deepEqual(JSON.parse(output.result.body), {
    error: 'Internal server error',
  });
  assertRedacted(output, ['TypeError', 'handler.cjs']);
});

test('missing environment configuration returns a generic response', async () => {
  const output = await runHandler(
    { httpMethod: 'GET', path: '/', headers: {} },
    undefined,
    {
      NYLAS_API_KEY: '',
      NYLAS_GRANT_ID: '',
    }
  );
  assert.equal(output.result.statusCode, 500);
  assert.deepEqual(JSON.parse(output.result.body), {
    error: 'Service is not configured.',
  });
});

test('client-defined multipart names are omitted from validation errors and logs', async () => {
  const output = await runHandler(
    multipart([['private-field-name-sentinel', 'value']])
  );
  assert.equal(output.result.statusCode, 400);
  assert.equal(JSON.parse(output.result.body).error, 'Missing required fields');
  assertRedacted(output, [
    'private-field-name-sentinel',
    'private-filename-sentinel',
  ]);
});

for (const status of [200, 400]) {
  test(`real SDK HTTP ${status} responses preserve safe success data and redact diagnostics`, async (t) => {
    let requestCount = 0;
    const server = http.createServer((request, response) => {
      requestCount++;
      assert.equal(request.method, 'POST');
      assert.equal(
        request.url,
        '/v3/grants/synthetic-loopback-grant/messages/send'
      );
      assert.equal(
        request.headers.authorization,
        'Bearer synthetic-loopback-key'
      );
      request.resume();
      request.on('end', () => {
        response.writeHead(status, { 'Content-Type': 'application/json' });
        response.end(
          JSON.stringify(
            status === 200
              ? {
                  request_id: 'fixture',
                  data: {
                    id: 'public-message-id',
                    private_response_key_sentinel:
                      'private-response-value-sentinel',
                  },
                }
              : {
                  request_id: 'fixture',
                  error: {
                    type: 'fixture_error',
                    message: 'private-provider-message-sentinel',
                  },
                }
          )
        );
      });
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    t.after(async () => {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    });
    const output = await runHandler(
      multipart([
        ['recipientEmail', 'private-recipient-sentinel@example.test'],
        ['subject', 'private-subject-sentinel'],
        ['message', 'private-message-sentinel'],
      ]),
      `http://127.0.0.1:${server.address().port}`
    );
    assert.equal(requestCount, 1);
    assert.equal(output.result.statusCode, status === 200 ? 200 : 500);
    const body = JSON.parse(output.result.body);
    if (status === 200) {
      assert.equal(body.success, true);
      assert.equal(body.messageId, 'public-message-id');
      assert.equal(body.attachmentsCount, 1);
    } else {
      assert.deepEqual(body, { error: 'Unable to send email.' });
    }
    assertRedacted(output, [
      'private-recipient-sentinel',
      'private-subject-sentinel',
      'private-message-sentinel',
      'private-filename-sentinel',
      'private-attachment-sentinel',
      'private-provider-message-sentinel',
      'private_response_key_sentinel',
      'private-response-value-sentinel',
    ]);
  });
}
