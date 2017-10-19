import Promise from 'bluebird';
import { EventEmitter } from 'events';
import { PassThrough } from 'stream';

import Delta from '../src/models/delta';
import NylasConnection from '../src/nylas-connection';

describe('Delta', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123');
    testContext.delta = new Delta(testContext.connection);
    jest.useFakeTimers();
  });

  describe('startStream (delta streaming)', () => {
    const createRequest = function(requestOpts) {
      const request = new EventEmitter();
      request.origOpts = requestOpts;
      request.abort = jest.fn();
      return request;
    };

    const createResponse = function(statusCode) {
      const response = new PassThrough();
      response.statusCode = statusCode;
      return response;
    };

    // Listens to the 'delta' event on the stream and pushes them to the returned array.
    const observeDeltas = function(stream) {
      const deltas = [];
      stream.on('delta', delta => deltas.push(delta));
      return deltas;
    };

    test('start and close stream', async () => {
      const stream = testContext.delta._startStream(
        createRequest,
        'deltacursor0'
      );
      const { request } = stream;

      expect(request.origOpts.method).toBe('GET');
      expect(request.origOpts.path).toBe('/delta/streaming');
      expect(request.origOpts.qs).toEqual({ cursor: 'deltacursor0' });

      const response = createResponse(200);
      request.emit('response', response);

      expect(request.abort.mock.calls.length).toEqual(0);
      stream.close();
      expect(request.abort.mock.calls.length).toEqual(1);
      expect(stream.request).toEqual(undefined);

      // Make sure the stream doesn't auto-restart if explicitly closed.
      jest.runTimersToTime(Delta.streamingTimeoutMs + 500);
      expect(stream.request).toEqual(undefined);
    });

    test('passes the correct params to the request', () => {
      const stream = testContext.delta._startStream(
        createRequest,
        'deltacursor0',
        {
          expanded: true,
          includeTypes: ['thread', 'message'],
          excludeTypes: ['event'],
        }
      );
      const { request } = stream;

      expect(request.origOpts.method).toBe('GET');
      expect(request.origOpts.path).toBe('/delta/streaming');
      expect(request.origOpts.qs).toEqual({
        cursor: 'deltacursor0',
        view: 'expanded',
        include_types: 'thread,message',
        exclude_types: 'event',
      });
    });

    test('stream response parsing', () => {
      const stream = testContext.delta._startStream(
        createRequest,
        'deltacursor0'
      );
      const { request } = stream;
      const deltas = observeDeltas(stream);

      const response = createResponse(200);
      request.emit('response', response);
      expect(deltas).toEqual([]);
      expect(stream.cursor).toEqual('deltacursor0');

      const delta1 = {
        cursor: 'deltacursor1',
        attributes: {},
        object: 'thread',
        event: 'create',
        id: 'deltaid1',
      };

      response.write(JSON.stringify(delta1));
      expect(deltas).toEqual([delta1]);
      expect(stream.cursor).toEqual('deltacursor1');

      stream.close();
    });

    test('stream response parsing, delta split across data packets', () => {
      const stream = testContext.delta._startStream(
        createRequest,
        'deltacursor0'
      );
      const { request } = stream;
      const deltas = observeDeltas(stream);

      const response = createResponse(200);
      request.emit('response', response);
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
      response.write(deltaStr.substring(0, 20));
      expect(deltas).toEqual([]);
      expect(stream.cursor).toEqual('deltacursor0');

      // ...now the rest of the delta comes in, and there should be a delta object.
      response.write(deltaStr.substring(20));
      expect(deltas).toEqual([delta1]);
      expect(stream.cursor).toEqual('deltacursor1');

      stream.close();
    });

    test('stream timeout and auto-restart', () => {
      const stream = testContext.delta._startStream(
        createRequest,
        'deltacursor0'
      );
      const { request } = stream;

      const response = createResponse(200);
      request.emit('response', response);
      expect(stream.cursor).toEqual('deltacursor0');

      const expectRequestNotAborted = request =>
        expect(request.abort.calls.length).toEqual(0);

      // Server sends a heartbeat every 5 seconds.
      response.write('\n');
      jest.runTimersToTime(5000);
      expect(request.abort.mock.calls.length).toEqual(0);
      response.write('\n');
      expect(request.abort.mock.calls.length).toEqual(0);

      // Actual response packets also reset the timeout.
      jest.runTimersToTime(5000);
      const delta1 = { cursor: 'deltacursor1' };
      response.write(JSON.stringify(delta1));
      expect(stream.cursor).toEqual('deltacursor1');
      jest.runTimersToTime(5500);
      expect(request.abort.mock.calls.length).toEqual(0);

      // If the timeout has elapsed since the last data received, the stream is restarted.
      jest.runTimersToTime(Delta.streamingTimeoutMs);
      // The old request should have been aborted, and a new request created.
      expect(request.abort.mock.calls.length).toEqual(1);
      expect(stream.request).not.toBe(request);
      // The new request should be using the last delta cursor received prior to timeout.
      expect(stream.request.origOpts.path).toBe('/delta/streaming');
      expect(stream.request.origOpts.qs).toEqual({ cursor: 'deltacursor1' });

      stream.close();
    });
  });

  describe('latestCursor', () => {
    test('returns a cursor', () => {
      testContext.connection.request = jest.fn(() =>
        Promise.resolve({ cursor: 'abcdefg' })
      );

      testContext.delta.latestCursor((err, cursor) =>
        expect(cursor).toEqual('abcdefg')
      );

      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/delta/latest_cursor',
      });
    });

    test('returns a null cursor in case of an error', () => {
      testContext.connection.request = jest.fn(() => Promise.reject('Error.'));
      testContext.delta
        .latestCursor((err, cursor) => {
          expect(err).toEqual('Error.');
          expect(cursor).toEqual(null);
        })
        .catch(err => {});
    });
  });
});
