const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const { createRequire } = require('node:module');
const { test } = require('node:test');
const { cleanupOwnedObject } = require('../../scripts/testLiveE2E.js');

const consumerDir = process.env.NYLAS_E2E_CONSUMER_DIR;
assert(consumerDir, 'Run this suite with npm run test:e2e');
const Nylas = createRequire(path.join(consumerDir, 'package.json'))('nylas');
const subject = 'nylas-node-e2e-11111111-1111-4111-8111-111111111111';
const recipient = 'fixture@example.invalid';

async function fixture(t, objectSubject = subject) {
  const requests = [];
  const message = {
    id: 'fixture-message',
    subject: objectSubject,
    to: [{ email: recipient }],
    folders: ['INBOX', 'SENT'],
  };
  const server = http.createServer((request, response) => {
    requests.push({ method: request.method, url: request.url });
    response.setHeader('content-type', 'application/json');
    if (request.method === 'DELETE') {
      message.folders = ['TRASH', 'SENT'];
      response.end(JSON.stringify({ request_id: 'fixture-delete' }));
    } else {
      response.end(
        JSON.stringify({ request_id: 'fixture-read', data: message })
      );
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => {
    server.closeAllConnections();
    return new Promise((resolve) => server.close(resolve));
  });
  const client = new Nylas({
    apiKey: 'fixture-key',
    apiUri: `http://127.0.0.1:${server.address().port}`,
    timeout: 5,
  });
  return {
    client,
    requests,
    message,
    options: {
      identifier: 'fixture-grant',
      id: 'fixture-message',
      idKey: 'messageId',
      subjects: new Set([subject]),
      recipient,
      isMessage: true,
      trashFolderIds: new Set(['TRASH']),
    },
  };
}

test('live cleanup accepts a still-readable soft-deleted message without repeated deletion', async (t) => {
  const { client, requests, options } = await fixture(t);
  await cleanupOwnedObject(client.messages, options);
  const visible = await client.messages.find({
    identifier: options.identifier,
    messageId: options.id,
  });
  assert.deepEqual(visible.data.folders, ['TRASH', 'SENT']);
  await cleanupOwnedObject(client.messages, options);
  const deletes = requests.filter((request) => request.method === 'DELETE');
  assert.equal(deletes.length, 1);
  assert.equal(
    deletes[0].url,
    '/v3/grants/fixture-grant/messages/fixture-message'
  );
  assert(requests.every((request) => !request.url.includes('hard_delete')));
});

test('live cleanup refuses an object outside its exact synthetic subject set', async (t) => {
  const { client, requests, options } = await fixture(t, 'unrelated-fixture');
  await assert.rejects(cleanupOwnedObject(client.messages, options));
  assert.equal(
    requests.filter((request) => request.method === 'DELETE').length,
    0
  );
});
