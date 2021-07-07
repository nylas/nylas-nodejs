import { PassThrough } from 'stream';
import fetch, { Response } from 'node-fetch';
import * as config from '../src/config.ts';
import Delta from '../src/models/delta';
import NylasConnection from '../src/nylas-connection';

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
    testContext.delta = new Delta(testContext.connection);
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
});
