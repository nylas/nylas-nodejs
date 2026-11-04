const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const { createRequire } = require('node:module');
const test = require('node:test');

const consumerRequire = createRequire(
  path.join(process.env.NYLAS_E2E_CONSUMER_DIR, 'package.json')
);
const Nylas = consumerRequire('nylas');

async function fixture(t, handler, timeout = 1) {
  const timers = new Set();
  const later = (callback, delay) => {
    const timer = setTimeout(callback, delay);
    timers.add(timer);
  };
  const server = http.createServer((request, response) => {
    handler(request, response, later);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    for (const timer of timers) clearTimeout(timer);
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });
  return new Nylas({
    apiKey: 'e2e-fixture-key',
    apiUri: `http://127.0.0.1:${server.address().port}`,
    timeout,
  });
}

async function bounded(promise) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('E2E request did not settle')),
          2000
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

const downloadParams = {
  identifier: 'me',
  attachmentId: 'attachment-id',
  queryParams: { messageId: 'message-id' },
};

for (const kind of ['json', 'binary']) {
  test(`terminated ${kind} response bodies expose typed errors and request context`, async (t) => {
    const client = await fixture(t, (_request, response, later) => {
      response.writeHead(200, {
        'Content-Type':
          kind === 'json' ? 'application/json' : 'application/octet-stream',
        'Content-Length': '1000',
        'x-request-id': 'terminated-request',
        'x-fastly-id': 'terminated-flow',
      });
      response.flushHeaders();
      response.write(kind === 'json' ? '{"data":' : 'partial-binary-data');
      later(() => response.destroy(), 40);
    });
    const request =
      kind === 'json'
        ? client.messages.find({ identifier: 'me', messageId: 'message-id' })
        : client.attachments.downloadBytes(downloadParams);

    await assert.rejects(bounded(request), (error) => {
      assert.ok(error instanceof Nylas.NylasApiError);
      assert.equal(error.type, 'sdk.response_body_error');
      assert.equal(error.requestId, 'terminated-request');
      assert.equal(error.flowId, 'terminated-flow');
      assert.equal(error.statusCode, 200);
      assert.equal(error.headers['x-request-id'], 'terminated-request');
      return true;
    });
  });
}

for (const kind of ['json', 'binary', 'error']) {
  test(`stalled ${kind} response bodies respect the configured timeout`, async (t) => {
    const client = await fixture(
      t,
      (_request, response) => {
        response.writeHead(kind === 'error' ? 503 : 200, {
          'Content-Type': 'application/json',
          'x-request-id': 'timeout-request',
          'x-fastly-id': 'timeout-flow',
        });
        response.flushHeaders();
        response.write(kind === 'binary' ? 'partial-binary-data' : '{"data":');
      },
      0.1
    );
    const request =
      kind === 'binary'
        ? client.attachments.downloadBytes(downloadParams)
        : client.messages.find({ identifier: 'me', messageId: 'message-id' });

    await assert.rejects(bounded(request), (error) => {
      assert.ok(error instanceof Nylas.NylasSdkTimeoutError);
      assert.equal(error.timeout, 0.1);
      assert.equal(error.requestId, 'timeout-request');
      assert.equal(error.flowId, 'timeout-flow');
      return true;
    });
  });
}

test('stream handoff permits caller-owned reads beyond the request timeout', async (t) => {
  const client = await fixture(
    t,
    (_request, response, later) => {
      response.writeHead(200, { 'Content-Type': 'application/octet-stream' });
      response.flushHeaders();
      response.write('first-');
      later(() => response.end('last'), 180);
    },
    0.1
  );

  const stream = await client.attachments.download(downloadParams);
  const reader = stream.getReader();
  const chunks = [];
  await bounded(
    (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(Buffer.from(value));
      }
    })()
  );
  assert.equal(Buffer.concat(chunks).toString(), 'first-last');
});

test('rules list preserves every nested page and remaining cursor over real HTTP', async (t) => {
  const requests = [];
  const client = await fixture(t, (request, response) => {
    const url = new URL(request.url, 'http://fixture');
    requests.push(url);
    const pageToken = url.searchParams.get('page_token');
    const page = pageToken ? Number(pageToken.replace('cursor-', '')) : 1;
    response.setHeader('Content-Type', 'application/json');
    response.end(
      JSON.stringify({
        request_id: `request-${page}`,
        data: {
          items: [{ id: `rule-${page}`, name: `Rule ${page}` }],
          next_cursor: `cursor-${page + 1}`,
        },
      })
    );
  });

  const result = await bounded(
    client.rules.list({ queryParams: { limit: 3 } })
  );
  assert.deepEqual(
    result.data.map((rule) => rule.id),
    ['rule-1', 'rule-2', 'rule-3']
  );
  assert.equal(result.requestId, 'request-3');
  assert.equal(result.nextCursor, 'cursor-4');
  assert.deepEqual(
    requests.map((url) => url.pathname),
    ['/v3/rules', '/v3/rules', '/v3/rules']
  );
  assert.deepEqual(
    requests.map((url) => url.searchParams.get('limit')),
    ['3', '2', '1']
  );
  assert.deepEqual(
    requests.map((url) => url.searchParams.get('page_token')),
    [null, 'cursor-2', 'cursor-3']
  );
});

test('public JSON resource methods preserve nulls and nested arrays in both directions', async (t) => {
  let wirePayload;
  const client = await fixture(t, (request, response) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => {
      wirePayload = JSON.parse(Buffer.concat(chunks).toString());
      response.setHeader('Content-Type', 'application/json');
      response.end(
        JSON.stringify({ request_id: 'array-request', data: wirePayload })
      );
    });
  });
  const requestBody = {
    title: 'Transport fixture',
    when: { startTime: 1, endTime: 2 },
    // Extension data deliberately exercises recursive serialization through a public method.
    customData: [null, [{ nestedKey: 'value' }, null, ['value', 7]], []],
    metadata: { Keep_Exact: [null, [{ Keep_Inner: 'value' }]] },
  };
  const result = await bounded(
    client.events.create({
      identifier: 'me',
      queryParams: { calendarId: 'calendar-id' },
      requestBody,
    })
  );

  assert.deepEqual(wirePayload.custom_data, [
    null,
    [{ nested_key: 'value' }, null, ['value', 7]],
    [],
  ]);
  assert.deepEqual(wirePayload.when, { start_time: 1, end_time: 2 });
  assert.deepEqual(wirePayload.metadata, requestBody.metadata);
  assert.deepEqual(result.data, requestBody);
});

for (const status of [200, 502]) {
  test(`malformed HTTP ${status} responses do not expose their body in errors`, async (t) => {
    const body = '{"private_fixture_content":"do-not-expose"} invalid-json';
    const client = await fixture(t, (_request, response) => {
      response.writeHead(status, {
        'Content-Type': 'application/json',
        'x-request-id': 'parse-request',
        'x-fastly-id': 'parse-flow',
      });
      response.end(body);
    });

    await assert.rejects(
      bounded(
        client.messages.find({
          identifier: 'me',
          messageId: 'message-id',
        })
      ),
      (error) => {
        assert.ok(error instanceof Nylas.NylasApiError);
        assert.equal(error.type, 'sdk.response_parse_error');
        assert.equal(error.requestId, 'parse-request');
        assert.equal(error.flowId, 'parse-flow');
        assert.equal(error.statusCode, status);
        assert.ok(!error.message.includes('private_fixture_content'));
        assert.ok(!error.message.includes('do-not-expose'));
        return true;
      }
    );
  });
}
