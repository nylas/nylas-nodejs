import NylasConnection from '../src/nylas-connection';
import Event from '../src/models/event';
import Nylas from '../src/nylas';
import fetch from 'node-fetch';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('Event', () => {
  let testContext;

  beforeEach(() => {
    Nylas.config({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
      apiServer: 'https://api.nylas.com',
    });
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
    jest.spyOn(testContext.connection, 'request');

    const response = receivedBody => {
      return {
        status: 200,
        buffer: () => {
          return Promise.resolve('body');
        },
        json: () => {
          return Promise.resolve(receivedBody);
        },
        headers: new Map(),
      };
    };

    fetch.mockImplementation(req => Promise.resolve(response(req.body)));

    testContext.event = new Event(testContext.connection);
  });

  describe('save', () => {
    test('should do a POST request if the event has no id', done => {
      testContext.event.id = undefined;
      return testContext.event.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual('https://api.nylas.com/events');
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
          calendar_id: undefined,
          busy: undefined,
          title: undefined,
          description: undefined,
          location: undefined,
          when: undefined,
          participants: [],
          notifications: [],
        });
        done();
      });
    });

    test('should do a PUT request if the event has an id', done => {
      testContext.event.id = 'id-1234';
      return testContext.event.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/events/id-1234'
        );
        expect(options.method).toEqual('PUT');
        expect(JSON.parse(options.body)).toEqual({
          calendar_id: undefined,
          busy: undefined,
          title: undefined,
          description: undefined,
          location: undefined,
          when: undefined,
          participants: [],
          notifications: [],
        });
        done();
      });
    });

    test('should include params in the request if they were passed in', done => {
      return testContext.event.save({ notify_participants: true }).then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.qs['notify_participants']).toEqual(true);
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/events?notify_participants=true'
        );
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
          calendar_id: undefined,
          busy: undefined,
          title: undefined,
          description: undefined,
          location: undefined,
          when: undefined,
          participants: [],
          notifications: [],
        });
        done();
      });
    });

    test('should create recurring event if recurrence is defined', done => {
      const recurrence = {
        rrule: ['RRULE:FREQ=WEEKLY;BYDAY=MO'],
        timezone: 'America/New_York',
      };
      testContext.event.recurrence = recurrence;
      return testContext.event.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual('https://api.nylas.com/events');
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
          calendar_id: undefined,
          busy: undefined,
          title: undefined,
          description: undefined,
          location: undefined,
          when: undefined,
          participants: [],
          notifications: [],
          recurrence: recurrence,
        });
        done();
      });
    });

    test('should create event with time when start and end are the same UNIX timestamp', done => {
      testContext.event.when = {};
      testContext.event.start = 1408875644;
      testContext.event.end = 1408875644;
      return testContext.event.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual('https://api.nylas.com/events');
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
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
          notifications: [],
          read_only: undefined,
          status: undefined,
        });
        done();
      });
    });

    test('should create event with start_time and end_time when start and end are different UNIX timestamps', done => {
      testContext.event.when = {};
      testContext.event.start = 1409594400;
      testContext.event.end = 1409598000;
      return testContext.event.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual('https://api.nylas.com/events');
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
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
          notifications: [],
          read_only: undefined,
          status: undefined,
        });
        done();
      });
    });

    test('should create event with date when start and end are same ISO date', done => {
      testContext.event.when = {};
      testContext.event.start = '1912-06-23';
      testContext.event.end = '1912-06-23';
      return testContext.event.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual('https://api.nylas.com/events');
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
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
          notifications: [],
          read_only: undefined,
          status: undefined,
        });
        done();
      });
    });

    test('should create event with start_date and end_date when start and end are different ISO date', done => {
      testContext.event.when = {};
      testContext.event.start = '1815-12-10';
      testContext.event.end = '1852-11-27';
      return testContext.event.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual('https://api.nylas.com/events');
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
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
          notifications: [],
          read_only: undefined,
        });
        done();
      });
    });

    test('should create event with time when event param `when` is updated with time', done => {
      testContext.event.when = { time: 1408875644 };
      return testContext.event.save().then(event => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual('https://api.nylas.com/events');
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
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
          notifications: [],
          read_only: undefined,
          status: undefined,
        });
        expect(event.start).toBe(1408875644);
        expect(event.end).toBe(1408875644);
        done();
      });
    });

    test('should create event with start_time and end_time when event param `when` is updated with start_time and end_time', done => {
      testContext.event.when = { start_time: 1409594400, end_time: 1409598000 };
      return testContext.event.save().then(event => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual('https://api.nylas.com/events');
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
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
          notifications: [],
          read_only: undefined,
          status: undefined,
        });
        expect(event.start).toBe(1409594400);
        expect(event.end).toBe(1409598000);
        done();
      });
    });

    test('should create event with date when the event param `when` is updated with date', done => {
      testContext.event.when = { date: '1912-06-23' };
      return testContext.event.save().then(event => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual('https://api.nylas.com/events');
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
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
          notifications: [],
          read_only: undefined,
          status: undefined,
        });
        expect(event.start).toBe('1912-06-23');
        expect(event.end).toBe('1912-06-23');
        done();
      });
    });

    test('should create event with start_date and end_date when the event param `when` is updated with start_date and end_date', done => {
      testContext.event.when = {
        start_date: '1815-12-10',
        end_date: '1852-11-27',
      };
      return testContext.event.save().then(event => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual('https://api.nylas.com/events');
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
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
          notifications: [],
          read_only: undefined,
          status: undefined,
        });
        expect(event.start).toBe('1815-12-10');
        expect(event.end).toBe('1852-11-27');
        done();
      });
    });

    test('setting event.start should create event.when if it does does not exist', done => {
      delete testContext.event.when;
      testContext.event.start = '1815-12-10';
      testContext.event.end = '1852-11-27';
      expect(testContext.event.when).toEqual({
        start_date: '1815-12-10',
        end_date: '1852-11-27',
      });
      return testContext.event.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual('https://api.nylas.com/events');
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
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
          notifications: [],
          read_only: undefined,
          status: undefined,
        });
        done();
      });
    });

    test('should create an event with a metadata object', done => {
      testContext.event.metadata = { hello: 'world' };
      testContext.event.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual('https://api.nylas.com/events');
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
          calendar_id: undefined,
          busy: undefined,
          title: undefined,
          description: undefined,
          location: undefined,
          when: undefined,
          _start: undefined,
          _end: undefined,
          participants: [],
          notifications: [],
          metadata: { hello: 'world' },
        });
        done();
      });
    });

    describe('conferencing', () => {
      test('should create an event with conferencing details', done => {
        const conferenceEvent = testContext.connection.events.build({
          conferencing: {
            provider: 'Zoom Meeting',
            details: {
              url: 'https://us02web.zoom.us/j/****************',
              meeting_code: '213',
              password: 'xyz',
              phone: ['+11234567890'],
            },
          },
        });
        conferenceEvent.save().then(() => {
          const options = testContext.connection.request.mock.calls[0][0];
          expect(options.url.toString()).toEqual(
            'https://api.nylas.com/events'
          );
          expect(options.method).toEqual('POST');
          expect(JSON.parse(options.body)).toEqual({
            calendar_id: undefined,
            busy: undefined,
            title: undefined,
            description: undefined,
            location: undefined,
            when: undefined,
            _start: undefined,
            _end: undefined,
            participants: [],
            notifications: [],
            conferencing: {
              provider: 'Zoom Meeting',
              details: {
                url: 'https://us02web.zoom.us/j/****************',
                meeting_code: '213',
                password: 'xyz',
                phone: ['+11234567890'],
              },
            },
          });
          done();
        });
      });

      test('should create an event with conferencing autocreate set', done => {
        const conferenceEvent = testContext.connection.events.build({
          conferencing: {
            provider: 'Zoom Meeting',
            autocreate: {
              settings: {
                password: '1234',
              },
            },
          },
        });
        conferenceEvent.save().then(() => {
          const options = testContext.connection.request.mock.calls[0][0];
          expect(options.url.toString()).toEqual(
            'https://api.nylas.com/events'
          );
          expect(options.method).toEqual('POST');
          expect(JSON.parse(options.body)).toEqual({
            calendar_id: undefined,
            busy: undefined,
            title: undefined,
            description: undefined,
            location: undefined,
            when: undefined,
            _start: undefined,
            _end: undefined,
            participants: [],
            notifications: [],
            conferencing: {
              provider: 'Zoom Meeting',
              autocreate: {
                settings: {
                  password: '1234',
                },
              },
            },
          });
          done();
        });
      });

      test('should throw exception if both conferencing details and autocreate are set', done => {
        const conferenceEvent = testContext.connection.events.build({
          conferencing: {
            provider: 'Zoom Meeting',
            details: {
              url: 'https://us02web.zoom.us/j/****************',
              meeting_code: '213',
              password: 'xyz',
              phone: ['+11234567890'],
            },
            autocreate: {
              settings: {
                password: '1234',
              },
            },
          },
        });
        conferenceEvent.save().catch(e => {
          expect(e).toEqual(
            new Error(
              "Cannot set both 'details' and 'autocreate' in conferencing object."
            )
          );
        });
        done();
      });
    });

    describe('notification', () => {
      test('should create an event with notifications', done => {
        const notificationEvent = testContext.event.fromJSON({
          notifications: [
            {
              body: 'Reminding you about our meeting.',
              minutes_before_event: 600,
              subject: 'Test Event Notification',
              type: 'email',
            },
            {
              type: 'webhook',
              minutes_before_event: 600,
              url:
                'https://hooks.service.com/services/T01A03EEXDE/B01TBNH532R/HubIZu1zog4oYdFqQ8VUcuiW',
              payload: JSON.stringify({
                text: 'Your reminder goes here!',
              }),
            },
            {
              type: 'sms',
              minutes_before_event: 60,
              message: 'Test Event Notification',
            },
          ],
        });

        expect(notificationEvent.notifications.length).toBe(3);
        expect(notificationEvent.notifications[0].body).toEqual(
          'Reminding you about our meeting.'
        );
        expect(notificationEvent.notifications[0].minutesBeforeEvent).toBe(600);
        expect(notificationEvent.notifications[0].subject).toEqual(
          'Test Event Notification'
        );
        expect(notificationEvent.notifications[0].type).toEqual('email');
        expect(notificationEvent.notifications[1].type).toEqual('webhook');
        expect(notificationEvent.notifications[1].minutesBeforeEvent).toBe(600);
        expect(notificationEvent.notifications[1].url).toEqual(
          'https://hooks.service.com/services/T01A03EEXDE/B01TBNH532R/HubIZu1zog4oYdFqQ8VUcuiW'
        );
        expect(notificationEvent.notifications[1].payload).toEqual(
          '{"text":"Your reminder goes here!"}'
        );
        expect(notificationEvent.notifications[2].type).toEqual('sms');
        expect(notificationEvent.notifications[2].minutesBeforeEvent).toBe(60);
        expect(notificationEvent.notifications[2].message).toEqual(
          'Test Event Notification'
        );

        notificationEvent.save().then(() => {
          const options = testContext.connection.request.mock.calls[0][0];
          expect(options.url.toString()).toEqual(
            'https://api.nylas.com/events'
          );
          expect(options.method).toEqual('POST');
          expect(JSON.parse(options.body)).toEqual({
            calendar_id: undefined,
            busy: undefined,
            title: undefined,
            description: undefined,
            location: undefined,
            when: undefined,
            _start: undefined,
            _end: undefined,
            participants: [],
            conferencing: undefined,
            notifications: [
              {
                body: 'Reminding you about our meeting.',
                minutes_before_event: 600,
                subject: 'Test Event Notification',
                type: 'email',
              },
              {
                minutes_before_event: 600,
                payload: '{"text":"Your reminder goes here!"}',
                type: 'webhook',
                url:
                  'https://hooks.service.com/services/T01A03EEXDE/B01TBNH532R/HubIZu1zog4oYdFqQ8VUcuiW',
              },
              {
                message: 'Test Event Notification',
                minutes_before_event: 60,
                type: 'sms',
              },
            ],
          });
          done();
        });
      });
    });

    describe('when the request succeeds', () => {
      beforeEach(() => {
        testContext.connection.request = jest.fn(() => {
          const eventJSON = {
            id: 'id-1234',
            title: 'test event',
            when: { time: 1409594400, object: 'time' },
            participants: [{ name: 'foo', email: 'bar', status: 'noreply' }],
            ical_uid: 'id-5678',
            master_event_id: 'master-1234',
            original_start_time: 1409592400,
          };
          return Promise.resolve(eventJSON);
        });
      });

      test('should resolve with the event object', done => {
        return testContext.event.save().then(event => {
          expect(event.id).toBe('id-1234');
          expect(event.title).toBe('test event');
          expect(event.when.time).toEqual(1409594400);
          expect(event.when.object).toEqual('time');
          expect(event.iCalUID).toBe('id-5678');
          expect(event.masterEventId).toBe('master-1234');
          expect(event.originalStartTime.toString()).toBe(
            new Date(1409592400 * 1000).toString()
          );
          const participant = event.participants[0];
          expect(participant.toJSON()).toEqual({
            name: 'foo',
            email: 'bar',
            status: 'noreply',
          });
          done();
        });
      });

      test('should call the callback with the event object', done => {
        return testContext.event.save((err, event) => {
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
          .catch(() => {
            // do nothing
          });
      });
    });
  });

  describe('rsvp', () => {
    test('should do a POST request to the RSVP endpoint', done => {
      testContext.event.id = 'public_id';
      return testContext.event.rsvp('yes', 'I will come.').then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/send-rsvp'
        );
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
          event_id: 'public_id',
          status: 'yes',
          comment: 'I will come.',
        });
        done();
      });
    });
  });
});
