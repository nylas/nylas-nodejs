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

    test('should create event with time when start and end are the same UNIX timestamp', done => {
      testContext.event.when = {};
      testContext.event.start = 1408875644;
      testContext.event.end = 1408875644;
      testContext.event.save().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            id: undefined,
            object: 'event',
            account_id: undefined,
            calendar_id: undefined,
            message_id: undefined,
            busy: undefined,
            title: undefined,
            description: undefined,
            owner: undefined,
            location: undefined,
            when: {
              time: 1408875644,
            },
            participants: [],
            read_only: undefined,
            status: undefined,
          },
          qs: {},
          path: '/events',
        });
        done();
      });
    });

    test('should create event with start_time and end_time when start and end are different UNIX timestamps', done => {
      testContext.event.when = {};
      testContext.event.start = 1409594400
      testContext.event.end = 1409598000
      testContext.event.save().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            id: undefined,
            object: 'event',
            account_id: undefined,
            calendar_id: undefined,
            message_id: undefined,
            busy: undefined,
            title: undefined,
            description: undefined,
            owner: undefined,
            location: undefined,
            when: {
              start_time: 1409594400,
              end_time: 1409598000,
            },
            participants: [],
            read_only: undefined,
            status: undefined,
          },
          qs: {},
          path: '/events',
        });
        done();
      });
    });

    test('should create event with date when start and end are same ISO date', done => {
      testContext.event.when = {};
      testContext.event.start = '1912-06-23';
      testContext.event.end = '1912-06-23';
      testContext.event.save().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            id: undefined,
            object: 'event',
            account_id: undefined,
            calendar_id: undefined,
            message_id: undefined,
            busy: undefined,
            title: undefined,
            description: undefined,
            owner: undefined,
            location: undefined,
            when: {
              date: '1912-06-23',
            },
            participants: [],
            read_only: undefined,
            status: undefined,
          },
          qs: {},
          path: '/events',
        });
        done();
      });
    });

    test('should create event with start_date and end_date when start and end are different ISO date', done => {
      testContext.event.when = {};
      testContext.event.start = '1815-12-10';
      testContext.event.end = '1852-11-27';
      testContext.event.save().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            id: undefined,
            object: 'event',
            account_id: undefined,
            calendar_id: undefined,
            message_id: undefined,
            busy: undefined,
            title: undefined,
            description: undefined,
            owner: undefined,
            location: undefined,
            when: {
              start_date: '1815-12-10',
              end_date: '1852-11-27',
            },
            participants: [],
            read_only: undefined,
            status: undefined,
          },
          qs: {},
          path: '/events',
        });
        done();
      });
    });

    test('should create event with time event param `when` is updated with time', done => {
      testContext.event.when = { time: 1408875644 };
      testContext.event.save().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            id: undefined,
            object: 'event',
            account_id: undefined,
            calendar_id: undefined,
            message_id: undefined,
            busy: undefined,
            title: undefined,
            description: undefined,
            owner: undefined,
            location: undefined,
            when: {
              time: 1408875644,
            },
            participants: [],
            read_only: undefined,
            status: undefined,
          },
          qs: {},
          path: '/events',
        });
        done();
      });
    });

    test('should create event with start_time and end_time when event param `when` is updated with start_time and end_time', done => {
      testContext.event.when = { start_time: 1409594400, end_time: 1409598000 };
      testContext.event.save().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            id: undefined,
            object: 'event',
            account_id: undefined,
            calendar_id: undefined,
            message_id: undefined,
            busy: undefined,
            title: undefined,
            description: undefined,
            owner: undefined,
            location: undefined,
            when: {
              start_time: 1409594400,
              end_time: 1409598000,
            },
            participants: [],
            read_only: undefined,
            status: undefined,
          },
          qs: {},
          path: '/events',
        });
        done();
      });
    });

    test('should create event with date when the event param `when` is updated with date', done => {
      testContext.event.when = { date: '1912-06-23' };
      testContext.event.save().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            id: undefined,
            object: 'event',
            account_id: undefined,
            calendar_id: undefined,
            message_id: undefined,
            busy: undefined,
            title: undefined,
            description: undefined,
            owner: undefined,
            location: undefined,
            when: {
              date: '1912-06-23',
            },
            participants: [],
            read_only: undefined,
            status: undefined,
          },
          qs: {},
          path: '/events',
        });
        done();
      });
    });

    test('should create event with start_date and end_date when the event param `when` is updated with start_date and end_date', done => {
      testContext.event.when = { start_date: '1815-12-10', end_date: '1852-11-27' };
      testContext.event.save().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            id: undefined,
            object: 'event',
            account_id: undefined,
            calendar_id: undefined,
            message_id: undefined,
            busy: undefined,
            title: undefined,
            description: undefined,
            owner: undefined,
            location: undefined,
            when: {
              start_date: '1815-12-10',
              end_date: '1852-11-27',
            },
            participants: [],
            read_only: undefined,
            status: undefined,
          },
          qs: {},
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
            start: 1409594400,
            end: 1409594400,
            when: { time: 1409594400 },
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
          expect(event.when.time).toEqual(1409594400);
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
