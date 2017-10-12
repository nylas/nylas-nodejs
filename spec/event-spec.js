import Promise from 'bluebird';
import request from 'request';
import _ from 'underscore';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Event from '../src/models/event';

const testUntil = function(fn) {
  let finished = false;
  runs(() => fn(callback => (finished = true)));
  waitsFor(() => finished);
};

describe('Event', function() {
  beforeEach(function() {
    this.connection = new NylasConnection('123');
    this.event = new Event(this.connection);
    return Promise.onPossiblyUnhandledRejection(function(e, promise) {});
  });

  describe('save', function() {
    it('should do a POST request if the event has no id', function() {
      this.event.id = undefined;
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.event.save();
      expect(this.connection.request).toHaveBeenCalledWith({
        method: 'POST',
        body: {
          id: undefined,
          object: 'event',
          account_id: undefined,
          calendar_id: undefined,
          busy: undefined,
          title: undefined,
          description: undefined,
          location: undefined,
          when: undefined,
          _start: undefined,
          _end: undefined,
          participants: [],
        },
        qs: {},
        path: '/events',
      });
    });

    it('should do a PUT request if the event has an id', function() {
      this.event.id = 'id-1234';
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.event.save();

      expect(this.connection.request).toHaveBeenCalledWith({
        method: 'PUT',
        body: {
          id: 'id-1234',
          object: 'event',
          account_id: undefined,
          calendar_id: undefined,
          busy: undefined,
          title: undefined,
          description: undefined,
          location: undefined,
          when: undefined,
          _start: undefined,
          _end: undefined,
          participants: [],
        },
        qs: {},
        path: '/events/id-1234',
      });
    });

    it('should include params in the request if they were passed in', function() {
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.event.save({ notify_participants: true });

      expect(this.connection.request).toHaveBeenCalledWith({
        method: 'POST',
        body: {
          object: 'event',
          account_id: undefined,
          calendar_id: undefined,
          busy: undefined,
          title: undefined,
          description: undefined,
          location: undefined,
          when: undefined,
          _start: undefined,
          _end: undefined,
          participants: [],
        },
        qs: {
          notify_participants: true,
        },
        path: '/events',
      });
    });

    describe('when the request succeeds', function() {
      beforeEach(function() {
        spyOn(this.connection, 'request').andCallFake(function() {
          const eventJSON = {
            id: 'id-1234',
            title: 'test event',
            when: {},
          };
          return Promise.resolve(eventJSON);
        });
      });

      it('should resolve with the event object', function() {
        testUntil(done => {
          this.event.save().then(function(event) {
            expect(event.id).toBe('id-1234');
            expect(event.title).toBe('test event');
            done();
          });
        });
      });

      it('should call the callback with the event object', function() {
        testUntil(done => {
          this.event.save(function(err, event) {
            expect(err).toBe(null);
            expect(event.id).toBe('id-1234');
            expect(event.title).toBe('test event');
            done();
          });
        });
      });
    });

    describe('when the request fails', function() {
      beforeEach(function() {
        this.error = new Error('Network error');
        spyOn(this.connection, 'request').andCallFake(() => {
          return Promise.reject(this.error);
        });
      });

      it('should reject with the error', function() {
        testUntil(done => {
          this.event.save().catch(err => {
            expect(err).toBe(this.error);
            done();
          });
        });
      });

      it('should call the callback with the error', function() {
        testUntil(done => {
          this.event.save((err, event) => {
            expect(err).toBe(this.error);
            expect(event).toBe(undefined);
            done();
          });
        });
      });
    });
  });

  describe('rsvp', () =>
    it('should do a POST request to the RSVP endpoint', function() {
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.event.id = 'public_id';
      this.event.rsvp('yes', 'I will come.');
      expect(this.connection.request).toHaveBeenCalledWith({
        method: 'POST',
        body: {
          event_id: 'public_id',
          status: 'yes',
          comment: 'I will come.',
        },
        path: '/send-rsvp',
      });
    }));
});
