import { PassThrough } from 'stream';
import fetch, { Response } from 'node-fetch';
import * as config from '../src/config.ts';
import NylasConnection from '../src/nylas-connection';
import Delta from '../src/models/delta';
import DeltaCollection from '../src/models/delta-collection';
import { Deltas } from '../src/models/deltas';

jest.mock('node-fetch', () => {
  const { Request, Response, Headers } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  fetch.Headers = Headers;
  return fetch;
});

describe('Delta', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
    testContext.delta = new DeltaCollection(testContext.connection);
    jest.useFakeTimers();
  });

  describe('startStream (delta streaming)', () => {
    config.setApiServer('https://api.nylas.com');

    // Listens to the 'delta' event on the stream and pushes them to the returned array.
    const observeDeltas = stream => {
      const deltas = [];
      stream.on('delta', delta => deltas.push(delta));
      return deltas;
    };

    test('start and close stream', async () => {
      fetch.mockImplementation(() =>
        Promise.resolve(new Response(new PassThrough(), { status: 200 }))
      );
      const stream = await testContext.delta.startStream('deltacursor0');
      const { request, controller } = stream.requestInfo;

      expect(request.method).toBe('GET');
      expect(request.url).toBe(
        `${config.apiServer}/delta/streaming?cursor=deltacursor0`
      );

      expect(controller.signal.aborted).toEqual(false);
      stream.close();
      expect(controller.signal.aborted).toEqual(true);
      expect(stream.requestInfo).toEqual(undefined);

      // Make sure the stream doesn't auto-restart if explicitly closed.
      jest.runTimersToTime(Delta.streamingTimeoutMs + 500);
      expect(stream.requestInfo).toEqual(undefined);
    });

    test('passes the correct params to the request', async () => {
      fetch.mockImplementation(() =>
        Promise.resolve(new Response(new PassThrough(), { status: 200 }))
      );
      const stream = await testContext.delta.startStream('deltacursor0', {
        expanded: true,
        includeTypes: ['thread', 'message'],
        excludeTypes: ['event'],
      });
      const { request } = stream.requestInfo;

      expect(request.method).toBe('GET');
      const search = [
        'view=expanded',
        'cursor=deltacursor0',
        'exclude_types=event',
        `include_types=thread%2Cmessage`,
      ].join('&');
      expect(request.url).toBe(`${config.apiServer}/delta/streaming?${search}`);
    });

    test('stream response parsing', async () => {
      const response = new Response(new PassThrough(), { status: 200 });
      fetch.mockImplementation(() => Promise.resolve(response));
      const stream = await testContext.delta.startStream('deltacursor0');
      const deltas = observeDeltas(stream);

      expect(deltas).toEqual([]);
      expect(stream.cursor).toEqual('deltacursor0');

      const delta1 = {
        cursor: 'deltacursor1',
        attributes: {},
        object: 'thread',
        event: 'create',
        id: 'deltaid1',
      };

      response.body.write(JSON.stringify(delta1));
      expect(deltas).toEqual([delta1]);
      expect(stream.cursor).toEqual('deltacursor1');

      stream.close();
    });

    test('stream response parsing, delta split across data packets', async () => {
      const response = new Response(new PassThrough(), { status: 200 });
      fetch.mockImplementation(() => Promise.resolve(response));
      const stream = await testContext.delta.startStream('deltacursor0');
      const deltas = observeDeltas(stream);

      expect(deltas).toEqual([]);
      expect(stream.cursor).toEqual('deltacursor0');

      const delta1 = {
        cursor: 'deltacursor1',
        attributes: {},
        object: 'thread',
        event: 'create',
        id: 'deltaid1',
      };
      const deltaStr = JSON.stringify(delta1);

      // Partial data packet will not result in a delta yet...
      response.body.write(deltaStr.substring(0, 20));
      expect(deltas).toEqual([]);
      expect(stream.cursor).toEqual('deltacursor0');

      // ...now the rest of the delta comes in, and there should be a delta object.
      response.body.write(deltaStr.substring(20));
      expect(deltas).toEqual([delta1]);
      expect(stream.cursor).toEqual('deltacursor1');

      stream.close();
    });

    test('stream timeout and auto-restart', async () => {
      const response = new Response(new PassThrough(), { status: 200 });
      fetch.mockImplementation(() => Promise.resolve(response));
      const stream = await testContext.delta.startStream('deltacursor0');
      const requestInfo = stream.requestInfo;
      const { controller } = requestInfo;

      expect(stream.cursor).toEqual('deltacursor0');

      // Server sends a heartbeat every 5 seconds.
      response.body.write('\n');
      jest.runTimersToTime(5000);
      expect(controller.signal.aborted).toEqual(false);
      response.body.write('\n');
      expect(controller.signal.aborted).toEqual(false);

      // Actual response packets also reset the timeout.
      jest.runTimersToTime(5000);
      const delta1 = { cursor: 'deltacursor1' };
      response.body.write(JSON.stringify(delta1));
      expect(stream.cursor).toEqual('deltacursor1');
      jest.runTimersToTime(5500);
      expect(controller.signal.aborted).toEqual(false);

      // If the timeout has elapsed since the last data received, the stream is restarted.
      jest.runTimersToTime(Delta.streamingTimeoutMs);
      // The old request should have been aborted, and a new request created.
      expect(controller.signal.aborted).toEqual(true);
      expect(stream.requestInfo).not.toBe(requestInfo);
      // The new request should be using the last delta cursor received prior to timeout.
      expect(stream.requestInfo.request.url).toBe(
        `${config.apiServer}/delta/streaming?cursor=deltacursor1`
      );

      stream.close();
    });
  });

  describe('latestCursor', () => {
    test('returns a cursor', done => {
      testContext.connection.request = jest.fn(() =>
        Promise.resolve({ cursor: 'abcdefg' })
      );

      return testContext.delta
        .latestCursor(() => {
          // do nothing.
        })
        .then(cursor => {
          expect(cursor).toEqual('abcdefg');
          expect(testContext.connection.request).toHaveBeenCalledWith({
            method: 'POST',
            path: '/delta/latest_cursor',
          });
          done();
        });
    });

    test('returns a null cursor in case of an error', done => {
      testContext.connection.request = jest.fn(() => Promise.reject('Error.'));
      return testContext.delta
        .latestCursor(() => {
          // do nothing.
        })
        .catch(e => {
          expect(e).toEqual('Error.');
          done();
        });
    });
  });

  describe('deserialize', () => {
    test('returns a cursor', done => {
      const json = {
        cursor_start: 'start_cursor',
        cursor_end: 'end_cursor',
        deltas: [
          {
            attributes: {
              account_id: 'aid-5678',
              given_name: 'First',
              surname: 'Last',
              id: 'id-1234',
              object: 'contact',
            },
            cursor: 'contact_cursor',
            event: 'create',
            id: 'delta-1',
            object: 'contact',
          },
          {
            attributes: {
              account_id: 'aid-5678',
              content_type: 'text/plain',
              filename: 'sample.txt',
              id: 'id-1234',
              object: 'file',
              size: 123,
            },
            cursor: 'file_cursor',
            event: 'create',
            id: 'delta-2',
            object: 'file',
          },
          {
            attributes: {
              account_id: 'aid-5678',
              to: [{ email: 'foo', name: 'bar' }],
              subject: 'foo',
              id: 'id-1234',
              object: 'message',
            },
            cursor: 'message_cursor',
            event: 'create',
            id: 'delta-3',
            object: 'message',
          },
          {
            attributes: {
              account_id: 'aid-5678',
              to: [{ email: 'foo', name: 'bar' }],
              subject: 'foo',
              id: 'id-1234',
              object: 'draft',
            },
            cursor: 'draft_cursor',
            event: 'create',
            id: 'delta-4',
            object: 'draft',
          },
          {
            attributes: {
              account_id: 'aid-5678',
              subject: 'Subject',
              id: 'id-1234',
              object: 'thread',
            },
            cursor: 'thread_cursor',
            event: 'create',
            id: 'delta-5',
            object: 'thread',
          },
          {
            attributes: {
              id: 'id-1234',
              title: 'test event',
              when: { time: 1409594400, object: 'time' },
              participants: [
                {
                  name: 'foo',
                  email: 'bar',
                  status: 'noreply',
                  comment: 'This is a comment',
                  phone_number: '416-000-0000',
                },
              ],
              ical_uid: 'id-5678',
              master_event_id: 'master-1234',
              original_start_time: 1409592400,
            },
            cursor: 'event_cursor',
            event: 'create',
            id: 'delta-6',
            object: 'event',
          },
          {
            attributes: {
              account_id: 'aid-5678',
              id: 'id-1234',
              object: 'folder',
              name: 'inbox',
              display_name: 'name',
            },
            cursor: 'folder_cursor',
            event: 'create',
            id: 'delta-7',
            object: 'folder',
          },
          {
            attributes: {
              account_id: 'aid-5678',
              id: 'id-1234',
              object: 'label',
              name: 'inbox',
            },
            cursor: 'label_cursor',
            event: 'create',
            id: 'delta-8',
            object: 'label',
          },
        ],
      };

      testContext.connection.request = jest.fn(() => Promise.resolve(json));
      const deltas = new Deltas(testContext.connection).fromJSON(json);

      expect(deltas.cursorStart).toEqual('start_cursor');
      expect(deltas.cursorEnd).toEqual('end_cursor');
      expect(deltas.deltas.length).toBe(8);

      expect(deltas.deltas[0].cursor).toEqual('contact_cursor');
      expect(deltas.deltas[0].event).toEqual('create');
      expect(deltas.deltas[0].id).toEqual('delta-1');
      expect(deltas.deltas[0].object).toEqual('contact');
      expect(deltas.deltas[0].objectAttributes.givenName).toEqual('First');
      expect(deltas.deltas[0].objectAttributes.surname).toEqual('Last');

      expect(deltas.deltas[1].cursor).toEqual('file_cursor');
      expect(deltas.deltas[1].event).toEqual('create');
      expect(deltas.deltas[1].id).toEqual('delta-2');
      expect(deltas.deltas[1].object).toEqual('file');
      expect(deltas.deltas[1].objectAttributes.filename).toEqual('sample.txt');
      expect(deltas.deltas[1].objectAttributes.size).toEqual(123);
      expect(deltas.deltas[1].objectAttributes.contentType).toEqual(
        'text/plain'
      );

      expect(deltas.deltas[2].cursor).toEqual('message_cursor');
      expect(deltas.deltas[2].event).toEqual('create');
      expect(deltas.deltas[2].id).toEqual('delta-3');
      expect(deltas.deltas[2].object).toEqual('message');
      expect(deltas.deltas[2].objectAttributes.to[0].email).toEqual('foo');
      expect(deltas.deltas[2].objectAttributes.to[0].name).toEqual('bar');
      expect(deltas.deltas[2].objectAttributes.subject).toEqual('foo');

      expect(deltas.deltas[3].cursor).toEqual('draft_cursor');
      expect(deltas.deltas[3].event).toEqual('create');
      expect(deltas.deltas[3].id).toEqual('delta-4');
      expect(deltas.deltas[3].object).toEqual('draft');
      expect(deltas.deltas[3].objectAttributes.to[0].email).toEqual('foo');
      expect(deltas.deltas[3].objectAttributes.to[0].name).toEqual('bar');
      expect(deltas.deltas[3].objectAttributes.subject).toEqual('foo');

      expect(deltas.deltas[4].cursor).toEqual('thread_cursor');
      expect(deltas.deltas[4].event).toEqual('create');
      expect(deltas.deltas[4].id).toEqual('delta-5');
      expect(deltas.deltas[4].object).toEqual('thread');
      expect(deltas.deltas[4].objectAttributes.subject).toEqual('Subject');

      expect(deltas.deltas[5].cursor).toEqual('event_cursor');
      expect(deltas.deltas[5].event).toEqual('create');
      expect(deltas.deltas[5].id).toEqual('delta-6');
      expect(deltas.deltas[5].object).toEqual('event');
      expect(deltas.deltas[5].objectAttributes.participants[0].name).toEqual(
        'foo'
      );
      expect(deltas.deltas[5].objectAttributes.participants[0].email).toEqual(
        'bar'
      );
      expect(deltas.deltas[5].objectAttributes.participants[0].status).toEqual(
        'noreply'
      );
      expect(deltas.deltas[5].objectAttributes.participants[0].comment).toEqual(
        'This is a comment'
      );
      expect(
        deltas.deltas[5].objectAttributes.participants[0].phoneNumber
      ).toEqual('416-000-0000');
      expect(deltas.deltas[5].objectAttributes.title).toEqual('test event');
      expect(deltas.deltas[5].objectAttributes.when.time).toEqual(1409594400);
      expect(deltas.deltas[5].objectAttributes.iCalUID).toEqual('id-5678');
      expect(deltas.deltas[5].objectAttributes.masterEventId).toEqual(
        'master-1234'
      );
      expect(deltas.deltas[5].objectAttributes.originalStartTime).toEqual(
        new Date(1409592400 * 1000)
      );

      expect(deltas.deltas[6].cursor).toEqual('folder_cursor');
      expect(deltas.deltas[6].event).toEqual('create');
      expect(deltas.deltas[6].id).toEqual('delta-7');
      expect(deltas.deltas[6].object).toEqual('folder');
      expect(deltas.deltas[6].objectAttributes.name).toEqual('inbox');
      expect(deltas.deltas[6].objectAttributes.displayName).toEqual('name');

      expect(deltas.deltas[7].cursor).toEqual('label_cursor');
      expect(deltas.deltas[7].event).toEqual('create');
      expect(deltas.deltas[7].id).toEqual('delta-8');
      expect(deltas.deltas[7].object).toEqual('label');
      expect(deltas.deltas[7].objectAttributes.name).toEqual('inbox');
      done();
    });
  });

  describe('since', () => {
    test('returns a cursor', done => {
      const json = {
        cursor_start: 'start_cursor',
        cursor_end: 'end_cursor',
        deltas: [
          {
            attributes: {
              account_id: 'aid-5678',
              content_type: 'text/plain',
              filename: 'sample.txt',
              id: 'id-1234',
              object: 'file',
              size: 123,
            },
            cursor: 'file_cursor',
            event: 'create',
            id: 'id-1234',
            object: 'file',
          },
        ],
      };

      testContext.connection.request = jest.fn(() => Promise.resolve(json));

      return testContext.delta.since('end_cursor').then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'GET',
          path: '/delta',
          qs: {
            cursor: 'end_cursor',
          },
        });
        done();
      });
    });
  });
});
