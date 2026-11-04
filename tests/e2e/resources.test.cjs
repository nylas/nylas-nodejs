const assert = require('node:assert/strict');
const http = require('node:http');
const { createRequire } = require('node:module');
const path = require('node:path');
const { Readable } = require('node:stream');
const { test } = require('node:test');

const consumerRequire = createRequire(
  path.join(process.env.NYLAS_E2E_CONSUMER_DIR, 'package.json')
);
const Nylas = consumerRequire('nylas');
const JSON_LIMIT = 3 * 1024 * 1024;
const UPLOADED_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

async function withServer(run) {
  const requests = [];
  const server = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    requests.push({
      method: req.method,
      url: new URL(req.url, `http://${req.headers.host}`),
      headers: req.headers,
      body: Buffer.concat(chunks),
    });

    let data = { id: 'fixture-message' };
    if (req.method === 'GET') data = [];
    if (req.url.endsWith('/attachment-uploads')) {
      data = {
        attachment_id: UPLOADED_ID,
        method: 'PUT',
        url: `http://${req.headers.host}/upload`,
        headers: { 'Content-Type': 'application/octet-stream' },
        expires_at: '2099-01-01T00:00:00Z',
        max_size: 157286400,
        size: 10,
        content_type: 'application/octet-stream',
        filename: 'upload.bin',
        grant_id: 'grant',
      };
    } else if (req.url.endsWith('/complete')) {
      data = { attachment_id: UPLOADED_ID, grant_id: 'grant', status: 'ready' };
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ request_id: 'fixture-request', data }));
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const apiUri = `http://127.0.0.1:${server.address().port}`;

  try {
    await run(new Nylas({ apiKey: 'loopback-test-only', apiUri }), requests);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }
}

async function multipart(request) {
  assert.match(
    request.headers['content-type'],
    /^multipart\/form-data; boundary=/
  );
  return new Response(request.body, {
    headers: { 'Content-Type': request.headers['content-type'] },
  }).formData();
}

async function invoke(client, operation, requestBody) {
  if (operation === 'message send') {
    return client.messages.send({ identifier: 'grant', requestBody });
  }
  if (operation === 'draft create') {
    return client.drafts.create({ identifier: 'grant', requestBody });
  }
  if (operation === 'draft update') {
    return client.drafts.update({
      identifier: 'grant',
      draftId: 'draft',
      requestBody,
    });
  }
  return client.transactionalSend.send({
    domainName: 'example.com',
    requestBody,
  });
}

test('draft anyEmail reaches HTTP as one comma-separated value without mutating input', async () => {
  await withServer(async (client, requests) => {
    const queryParams = Object.freeze({
      anyEmail: Object.freeze(['first@example.com', 'second@example.com']),
      subject: 'Report',
    });
    await client.drafts.list({ identifier: 'grant', queryParams });

    assert.equal(requests.length, 1);
    assert.equal(requests[0].method, 'GET');
    assert.equal(requests[0].url.pathname, '/v3/grants/grant/drafts');
    assert.deepEqual(requests[0].url.searchParams.getAll('any_email'), [
      'first@example.com,second@example.com',
    ]);
    assert.equal(requests[0].url.searchParams.get('subject'), 'Report');
    assert.deepEqual(queryParams.anyEmail, [
      'first@example.com',
      'second@example.com',
    ]);
  });
});

test('message and draft upload payloads preserve actual bytes through the packed SDK', async (t) => {
  const operations = [
    'message send',
    'draft create',
    'draft update',
    'transactional send',
  ];
  const cases = [
    ['buffer', (bytes) => bytes],
    ['base64', (bytes) => bytes.toString('base64')],
    ['stream without size', (bytes) => Readable.from([bytes])],
    [
      'stream with size',
      (bytes) => Readable.from([bytes]),
      (bytes) => ({ size: bytes.length }),
    ],
  ];

  for (const operation of operations) {
    for (const [name, makeContent, extraFields] of cases) {
      await t.test(
        `${operation}: ${name} over 3MiB uses multipart with intact bytes`,
        async () => {
          await withServer(async (client, requests) => {
            const expected = Buffer.alloc(JSON_LIMIT + 17, 0xab);
            await invoke(client, operation, {
              to: [{ email: 'test@example.com' }],
              subject: 'Multipart bytes',
              attachments: [
                {
                  filename: 'payload.bin',
                  contentType: 'application/octet-stream',
                  content: makeContent(expected),
                  ...extraFields?.(expected),
                },
              ],
            });

            assert.equal(requests.length, 1);
            const form = await multipart(requests[0]);
            assert.equal(
              JSON.parse(form.get('message')).subject,
              'Multipart bytes'
            );
            assert.equal(form.get('file0').name, 'payload.bin');
            assert.deepEqual(
              Buffer.from(await form.get('file0').arrayBuffer()),
              expected
            );
          });
        }
      );
    }
  }
});

test('base64 expansion selects multipart before a raw Buffer reaches 3MiB', async () => {
  await withServer(async (client, requests) => {
    const expected = Buffer.alloc(Math.floor(2.4 * 1024 * 1024), 0xcc);
    await client.messages.send({
      identifier: 'grant',
      requestBody: {
        to: [{ email: 'test@example.com' }],
        attachments: [
          {
            filename: 'expanded.bin',
            contentType: 'application/octet-stream',
            content: expected,
            size: 1,
          },
        ],
      },
    });
    const form = await multipart(requests[0]);
    assert.deepEqual(
      Buffer.from(await form.get('file0').arrayBuffer()),
      expected
    );
  });
});

test('small binary content uses JSON with correct base64 bytes', async () => {
  await withServer(async (client, requests) => {
    const expected = Buffer.from([0, 1, 2, 253, 254, 255]);
    await client.messages.send({
      identifier: 'grant',
      requestBody: {
        to: [{ email: 'test@example.com' }],
        attachments: [
          {
            filename: 'small.bin',
            contentType: 'application/octet-stream',
            content: expected,
          },
        ],
      },
    });
    assert.match(requests[0].headers['content-type'], /^application\/json/);
    const body = JSON.parse(requests[0].body);
    assert.deepEqual(
      Buffer.from(body.attachments[0].content, 'base64'),
      expected
    );
    assert.equal(body.attachments[0].content_type, 'application/octet-stream');
  });
});

test('completed upload references survive JSON and multipart send and draft requests', async (t) => {
  for (const operation of ['message send', 'draft create', 'draft update']) {
    await t.test(
      `${operation}: ID-only reference reaches JSON without invented file metadata`,
      async () => {
        await withServer(async (client, requests) => {
          await invoke(client, operation, {
            to: [{ email: 'test@example.com' }],
            body: '<img src="cid:chart1">',
            attachments: [{ id: UPLOADED_ID, contentId: 'chart1' }],
          });
          assert.match(
            requests[0].headers['content-type'],
            /^application\/json/
          );
          assert.deepEqual(JSON.parse(requests[0].body).attachments, [
            { id: UPLOADED_ID, content_id: 'chart1' },
          ]);
        });
      }
    );
    await t.test(
      `${operation}: multipart keeps uploaded references and binary files`,
      async () => {
        await withServer(async (client, requests) => {
          const expected = Buffer.alloc(JSON_LIMIT + 1, 0xdd);
          await invoke(client, operation, {
            to: [{ email: 'test@example.com' }],
            attachments: [
              { id: UPLOADED_ID, contentId: 'chart1' },
              {
                filename: 'extra.bin',
                contentType: 'application/octet-stream',
                content: expected,
              },
            ],
          });
          const form = await multipart(requests[0]);
          assert.deepEqual(JSON.parse(form.get('message')).attachments, [
            { id: UPLOADED_ID, content_id: 'chart1' },
          ]);
          assert.deepEqual([...form.keys()], ['message', 'file1']);
          assert.deepEqual(
            Buffer.from(await form.get('file1').arrayBuffer()),
            expected
          );
        });
      }
    );
  }
});

test('invalid uploaded references fail before any HTTP request', async () => {
  await withServer(async (client, requests) => {
    for (const reference of [
      {},
      { id: '' },
      { id: '../attachment' },
      { id: 'a'.repeat(256) },
      { id: UPLOADED_ID, contentId: 'unsafe\r\nvalue' },
      { id: UPLOADED_ID, filename: 'unexpected.bin' },
    ]) {
      await assert.rejects(
        client.messages.send({
          identifier: 'grant',
          requestBody: {
            to: [{ email: 'test@example.com' }],
            attachments: [reference],
          },
        }),
        /Invalid attachment reference\./
      );
    }
    assert.equal(requests.length, 0);
  });
});

test('public upload-session flow can send its completed ID without SDK or fetch mocks', async () => {
  await withServer(async (client, requests) => {
    const bytes = Buffer.from('file bytes');
    const created = await client.attachments.createUploadSession({
      identifier: 'grant',
      requestBody: {
        filename: 'upload.bin',
        contentType: 'application/octet-stream',
        size: bytes.length,
      },
    });
    const uploaded = await fetch(created.data.url, {
      method: created.data.method,
      headers: created.data.headers,
      body: bytes,
    });
    assert.equal(uploaded.status, 200);
    const completed = await client.attachments.completeUploadSession({
      identifier: 'grant',
      attachmentId: created.data.attachmentId,
    });
    assert.equal(completed.data.status, 'ready');
    await client.messages.send({
      identifier: 'grant',
      requestBody: {
        to: [{ email: 'test@example.com' }],
        attachments: [{ id: completed.data.attachmentId }],
      },
    });

    assert.deepEqual(
      requests.map((request) => [request.method, request.url.pathname]),
      [
        ['POST', '/v3/grants/grant/attachment-uploads'],
        ['PUT', '/upload'],
        ['POST', `/v3/grants/grant/attachment-uploads/${UPLOADED_ID}/complete`],
        ['POST', '/v3/grants/grant/messages/send'],
      ]
    );
    assert.deepEqual(requests[1].body, bytes);
    assert.equal(requests[1].headers.authorization, undefined);
    assert.deepEqual(JSON.parse(requests[3].body).attachments, [
      { id: UPLOADED_ID },
    ]);
  });
});
