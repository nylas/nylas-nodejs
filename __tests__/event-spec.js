import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Event from '../src/models/event';

describe('Event', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
    testContext.connection.request = jest.fn(() => Promise.resolve());
    testContext.event = new Event(testContext.connection);
  });

  describe('save', () => {
    test('should do a POST request if the event has no id', done => {
      testContext.event.id = undefined;
      testContext.event.save().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
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
        done();
      });
    });

    test('should do a PUT request if the event has an id', done => {
      testContext.event.id = 'id-1234';
      testContext.event.save().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
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
        done();
      });
    });

    test('should include params in the request if they were passed in', done => {
      testContext.event.save({ notify_participants: true }).then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
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
        done();
      });
    });

    describe('when the request succeeds', () => {
      beforeEach(() => {
        testContext.connection.request = jest.fn(() => {
          const eventJSON = {
            id: 'id-1234',
            title: 'test event',
            when: {},
            participants: [
              {'name': 'foo', 'email': 'bar', 'status': 'noreply'}
            ],
          };
          return Promise.resolve(eventJSON);
        });
      });

      test('should resolve with the event object', done => {
        testContext.event.save().then(event => {
          expect(event.id).toBe('id-1234');
          expect(event.title).toBe('test event');
          let participant = event.participants[0];
          expect(participant.toJSON()).toEqual(
            {'name': 'foo', 'email': 'bar', 'status': 'noreply'});
          done();
        });
      });

      test('should call the callback with the event object', done => {
        testContext.event.save((err, event) => {
          expect(err).toBe(null);
          expect(event.id).toBe('id-1234');
          expect(event.title).toBe('test event');
          done();
        });
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        testContext.error = new Error('Network error');
        testContext.connection.request = jest.fn(() =>
          Promise.reject(testContext.error)
        );
      });

      test('should reject with the error', done => {
        testContext.event.save().catch(err => {
          expect(err).toBe(testContext.error);
          done();
        });
      });

      test('should call the callback with the error', done => {
        testContext.event
          .save((err, event) => {
            expect(err).toBe(testContext.error);
            expect(event).toBe(undefined);
            done();
          })
          .catch(() => {});
      });
    });
  });

  describe('rsvp', () => {
    test('should do a POST request to the RSVP endpoint', () => {
      testContext.event.id = 'public_id';
      testContext.event.rsvp('yes', 'I will come.');
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'POST',
        body: {
          event_id: 'public_id',
          status: 'yes',
          comment: 'I will come.',
        },
        path: '/send-rsvp',
      });
    });
  });
});
