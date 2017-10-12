import jasmine from 'jasmine-node';
import Promise from 'bluebird';
import { EventEmitter } from 'events';
import { PassThrough } from 'stream';

import Delta from '../src/models/delta';
import NylasConnection from '../src/nylas-connection';

const testUntil = function(fn) {
  let finished = false;
  runs(() => fn(callback => (finished = true)));
  waitsFor(() => finished);
};

describe('Delta', function() {
  beforeEach(function() {
    this.connection = new NylasConnection('123');
    this.delta = new Delta(this.connection);
    jasmine.Clock.useMock();
    // Work around clearTimeout not being correctly mocked in Jasmine:
    // https://github.com/mhevery/jasmine-node/issues/276
    spyOn(global, 'clearTimeout').andCallFake(function() {
      return jasmine.Clock.installed.clearTimeout.apply(this, arguments);
    });
  });

  describe('startStream (delta streaming)', function() {
    const createRequest = function(requestOpts) {
      const request = new EventEmitter();
      request.origOpts = requestOpts;
      request.abort = jasmine.createSpy('abort');
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

    it('start and close stream', function() {
      const stream = this.delta._startStream(createRequest, 'deltacursor0');
      const { request } = stream;

      expect(request.origOpts.method).toBe('GET');
      expect(request.origOpts.path).toBe('/delta/streaming');
      expect(request.origOpts.qs).toEqual({ cursor: 'deltacursor0' });

      const response = createResponse(200);
      request.emit('response', response);

      expect(request.abort.calls.length).toEqual(0);
      stream.close();
      expect(request.abort.calls.length).toEqual(1);
      expect(stream.request).toEqual(undefined);

      // Make sure the stream doesn't auto-restart if explicitly closed.
      jasmine.Clock.tick(Delta.streamingTimeoutMs + 500);
      expect(stream.request).toEqual(undefined);
    });

    it('passes the correct params to the request', function() {
      const stream = this.delta._startStream(createRequest, 'deltacursor0', {
        expanded: true,
        includeTypes: ['thread', 'message'],
        excludeTypes: ['event'],
      });
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

    it('stream response parsing', function() {
      const stream = this.delta._startStream(createRequest, 'deltacursor0');
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

    it('stream response parsing, delta split across data packets', function() {
      const stream = this.delta._startStream(createRequest, 'deltacursor0');
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

    return it('stream timeout and auto-restart', function() {
      const stream = this.delta._startStream(createRequest, 'deltacursor0');
      const { request } = stream;

      const response = createResponse(200);
      request.emit('response', response);
      expect(stream.cursor).toEqual('deltacursor0');

      const expectRequestNotAborted = request =>
        expect(request.abort.calls.length).toEqual(0);

      // Server sends a heartbeat every 5 seconds.
      response.write('\n');
      jasmine.Clock.tick(5000);
      expect(request.abort.calls.length).toEqual(0);
      response.write('\n');
      expect(request.abort.calls.length).toEqual(0);

      // Actual response packets also reset the timeout.
      jasmine.Clock.tick(5000);
      const delta1 = { cursor: 'deltacursor1' };
      response.write(JSON.stringify(delta1));
      expect(stream.cursor).toEqual('deltacursor1');
      jasmine.Clock.tick(5500);
      expect(request.abort.calls.length).toEqual(0);

      // If the timeout has elapsed since the last data received, the stream is restarted.
      jasmine.Clock.tick(Delta.streamingTimeoutMs);
      // The old request should have been aborted, and a new request created.
      expect(request.abort.calls.length).toEqual(1);
      expect(stream.request).not.toBe(request);
      // The new request should be using the last delta cursor received prior to timeout.
      expect(stream.request.origOpts.path).toBe('/delta/streaming');
      expect(stream.request.origOpts.qs).toEqual({ cursor: 'deltacursor1' });

      stream.close();
    });
  });

  describe('latestCursor', function() {
    it('returns a cursor', function() {
      spyOn(this.connection, 'request').andCallFake(() =>
        Promise.resolve({ cursor: 'abcdefg' })
      );

      this.delta.latestCursor((err, cursor) =>
        expect(cursor).toEqual('abcdefg')
      );

      expect(this.connection.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/delta/latest_cursor',
      });
    });

    it('returns a null cursor in case of an error', function() {
      spyOn(this.connection, 'request').andCallFake(() =>
        Promise.reject('Error.')
      );
      this.delta.latestCursor(function(err, cursor) {
        expect(err).toEqual('Error.');
        expect(cursor).toEqual(null);
      });
    });
  });
});
