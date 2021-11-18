import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import fetch from 'node-fetch';
import SchedulerTimeSlot from '../src/models/scheduler-time-slot';
import SchedulerBookingRequest from '../src/models/scheduler-booking-request';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('SchedulerRestfulModelCollection', () => {
  let testContext;

  beforeEach(() => {
    Nylas.config({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
      apiServer: 'https://api.nylas.com',
    });
    testContext = {};
    testContext.connection = new NylasConnection('abc-123', {
      clientId: 'myClientId',
    });
    jest.spyOn(testContext.connection, 'request');
  });

  describe('ProviderAvailability', () => {
    beforeEach(() => {
      const availability = {
        busy: [
          {
            end: 1636731958,
            start: 1636728347,
          },
        ],
        email: 'test@example.com',
        name: 'John Doe',
      };

      const response = {
        status: 200,
        buffer: () => {
          return Promise.resolve('body');
        },
        json: () => {
          return Promise.resolve(availability);
        },
        headers: new Map(),
      };

      fetch.mockImplementation(() => Promise.resolve(response));
    });

    test('getGoogleAvailability should call the correct endpoint', done => {
      testContext.connection.scheduler.getGoogleAvailability().then(json => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.schedule.nylas.com/schedule/availability/google'
        );
        expect(options.method).toEqual('GET');
        expect(json.busy[0].end).toBe(1636731958);
        expect(json.busy[0].start).toBe(1636728347);
        expect(json.email).toEqual('test@example.com');
        expect(json.name).toEqual('John Doe');
        done();
      });
    });

    test('getOffice365Availability should call the correct endpoint', done => {
      testContext.connection.scheduler.getOffice365Availability().then(json => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.schedule.nylas.com/schedule/availability/o365'
        );
        expect(options.method).toEqual('GET');
        expect(json.busy[0].end).toBe(1636731958);
        expect(json.busy[0].start).toBe(1636728347);
        expect(json.email).toEqual('test@example.com');
        expect(json.name).toEqual('John Doe');
        done();
      });
    });
  });

  describe('Public Booking API', () => {
    beforeEach(() => {
      const availability = {
        busy: [
          {
            end: 1636731958,
            start: 1636728347,
          },
        ],
        email: 'test@example.com',
        name: 'John Doe',
      };

      const response = {
        status: 200,
        buffer: () => {
          return Promise.resolve('body');
        },
        json: () => {
          return Promise.resolve(availability);
        },
        headers: new Map(),
      };

      fetch.mockImplementation(() => Promise.resolve(response));
    });

    test('getPageBySlug should return a Scheduler type', done => {
      const schedulerJSON = {
        app_client_id: 'test-client-id',
        app_organization_id: 0,
        config: {
          timezone: 'America/Los_Angeles',
        },
        edit_token: 'token',
        name: 'Test',
        slug: 'test-slug',
        created_at: new Date('2021-06-24T21:28:09Z'),
        modified_at: new Date('2021-06-24T21:28:09Z'),
      };

      const response = {
        status: 200,
        buffer: () => {
          return Promise.resolve('body');
        },
        json: () => {
          return Promise.resolve(schedulerJSON);
        },
        headers: new Map(),
      };

      fetch.mockImplementation(() => Promise.resolve(response));

      testContext.connection.scheduler
        .getPageBySlug('test-slug')
        .then(scheduler => {
          const options = testContext.connection.request.mock.calls[0][0];
          expect(options.url.toString()).toEqual(
            'https://api.schedule.nylas.com/schedule/test-slug/info'
          );
          expect(options.method).toEqual('GET');
          expect(scheduler.appClientId).toEqual('test-client-id');
          expect(scheduler.appOrganizationId).toBe(0);
          expect(scheduler.config.timezone).toEqual('America/Los_Angeles');
          expect(scheduler.editToken).toEqual('token');
          expect(scheduler.name).toEqual('Test');
          expect(scheduler.slug).toEqual('test-slug');
          expect(scheduler.createdAt).toEqual(new Date('2021-06-24T21:28:09Z'));
          expect(scheduler.modifiedAt).toEqual(
            new Date('2021-06-24T21:28:09Z')
          );
          done();
        });
    });

    test('getAvailableTimeSlots should return an array of SchedulerTimeSlot', done => {
      const schedulerTimeSlots = [
        {
          account_id: 'test-account-id',
          calendar_id: 'test-calendar-id',
          emails: ['test@example.com'],
          end: 1636731958,
          host_name: 'www.hostname.com',
          start: 1636728347,
        },
      ];

      const response = {
        status: 200,
        buffer: () => {
          return Promise.resolve('body');
        },
        json: () => {
          return Promise.resolve(schedulerTimeSlots);
        },
        headers: new Map(),
      };

      fetch.mockImplementation(() => Promise.resolve(response));

      testContext.connection.scheduler
        .getAvailableTimeSlots('test-slug')
        .then(timeslots => {
          const options = testContext.connection.request.mock.calls[0][0];
          expect(options.url.toString()).toEqual(
            'https://api.schedule.nylas.com/schedule/test-slug/timeslots'
          );
          expect(options.method).toEqual('GET');
          expect(timeslots.length).toBe(1);
          const timeslot = timeslots[0];
          expect(timeslot.accountId).toEqual('test-account-id');
          expect(timeslot.calendarId).toEqual('test-calendar-id');
          expect(timeslot.emails[0]).toEqual('test@example.com');
          expect(timeslot.hostName).toEqual('www.hostname.com');
          expect(timeslot.end).toEqual(new Date(1636731958 * 1000));
          expect(timeslot.start).toEqual(new Date(1636728347 * 1000));
          done();
        });
    });

    test('cancel booking', done => {
      const success = {
        success: true,
      };

      const response = {
        status: 200,
        buffer: () => {
          return Promise.resolve('body');
        },
        json: () => {
          return Promise.resolve(success);
        },
        headers: new Map(),
      };

      fetch.mockImplementation(() => Promise.resolve(response));

      testContext.connection.scheduler
        .cancelBooking('test-slug', 'test-edit-hash', 'test')
        .then(json => {
          const options = testContext.connection.request.mock.calls[0][0];
          expect(options.url.toString()).toEqual(
            'https://api.schedule.nylas.com/schedule/test-slug/test-edit-hash/cancel'
          );
          expect(options.method).toEqual('POST');
          expect(json).toEqual({
            success: true,
          });
          done();
        });
    });

    describe('SchedulerBookingConfirmation', () => {
      beforeEach(() => {
        const bookingConfirmation = {
          account_id: 'test-account-id',
          additional_field_values: {
            test: 'yes',
          },
          calendar_event_id: 'test-event-id',
          calendar_id: 'test-calendar-id',
          edit_hash: 'test-edit-hash',
          end_time: 1636731958,
          id: 123,
          is_confirmed: false,
          location: 'Earth',
          recipient_email: 'recipient@example.com',
          recipient_locale: 'en_US',
          recipient_name: 'Recipient Doe',
          recipient_tz: 'America/New_York',
          start_time: 1636728347,
          title: 'Test Booking',
        };

        const response = {
          status: 200,
          buffer: () => {
            return Promise.resolve('body');
          },
          json: () => {
            return Promise.resolve(bookingConfirmation);
          },
          headers: new Map(),
        };

        fetch.mockImplementation(() => Promise.resolve(response));
      });

      test('bookTimeSlot should return a SchedulerBookingConfirmation type', done => {
        const slot = new SchedulerTimeSlot(testContext.connection);
        slot.accountId = 'test-account-id';
        slot.calendarId = 'test-calendar-id';
        slot.emails = ['recipient@example.com'];
        slot.start = new Date(1636728347 * 1000);
        slot.end = new Date(1636731958 * 1000);
        const timeslotToBook = new SchedulerBookingRequest(
          testContext.connection
        );
        timeslotToBook.additionalValues = {
          test: 'yes',
        };
        timeslotToBook.email = 'recipient@example.com';
        timeslotToBook.locale = 'en_US';
        timeslotToBook.name = 'Recipient Doe';
        timeslotToBook.timezone = 'America/New_York';
        timeslotToBook.slot = slot;

        testContext.connection.scheduler
          .bookTimeSlot('test-slug', timeslotToBook)
          .then(bookingConfirmation => {
            const options = testContext.connection.request.mock.calls[0][0];
            expect(options.url.toString()).toEqual(
              'https://api.schedule.nylas.com/schedule/test-slug/timeslots'
            );
            expect(options.method).toEqual('POST');
            expect(JSON.parse(options.body)).toEqual({
              additional_values: {
                test: 'yes',
              },
              email: 'recipient@example.com',
              locale: 'en_US',
              name: 'Recipient Doe',
              timezone: 'America/New_York',
              slot: {
                account_id: 'test-account-id',
                calendar_id: 'test-calendar-id',
                emails: ['recipient@example.com'],
                start: 1636728347,
                end: 1636731958,
              },
            });

            expect(bookingConfirmation.accountId).toEqual('test-account-id');
            expect(bookingConfirmation.calendarId).toEqual('test-calendar-id');
            expect(bookingConfirmation.additionalFieldValues).toEqual({
              test: 'yes',
            });
            expect(bookingConfirmation.calendarEventId).toEqual(
              'test-event-id'
            );
            expect(bookingConfirmation.calendarId).toEqual('test-calendar-id');
            expect(bookingConfirmation.calendarEventId).toEqual(
              'test-event-id'
            );
            expect(bookingConfirmation.editHash).toEqual('test-edit-hash');
            expect(bookingConfirmation.id).toEqual(123);
            expect(bookingConfirmation.isConfirmed).toBe(false);
            expect(bookingConfirmation.location).toEqual('Earth');
            expect(bookingConfirmation.title).toEqual('Test Booking');
            expect(bookingConfirmation.recipientEmail).toEqual(
              'recipient@example.com'
            );
            expect(bookingConfirmation.recipientLocale).toEqual('en_US');
            expect(bookingConfirmation.recipientName).toEqual('Recipient Doe');
            expect(bookingConfirmation.recipientTz).toEqual('America/New_York');
            expect(bookingConfirmation.endTime).toEqual(
              new Date(1636731958 * 1000)
            );
            expect(bookingConfirmation.startTime).toEqual(
              new Date(1636728347 * 1000)
            );
            done();
          });
      });

      test('confirmBooking should return a SchedulerBookingConfirmation type', done => {
        testContext.connection.scheduler
          .confirmBooking('test-slug', 'test-edit-hash')
          .then(bookingConfirmation => {
            const options = testContext.connection.request.mock.calls[0][0];
            expect(options.url.toString()).toEqual(
              'https://api.schedule.nylas.com/schedule/test-slug/test-edit-hash/confirm'
            );
            expect(options.method).toEqual('POST');

            expect(bookingConfirmation.accountId).toEqual('test-account-id');
            expect(bookingConfirmation.calendarId).toEqual('test-calendar-id');
            expect(bookingConfirmation.additionalFieldValues).toEqual({
              test: 'yes',
            });
            expect(bookingConfirmation.calendarEventId).toEqual(
              'test-event-id'
            );
            expect(bookingConfirmation.calendarId).toEqual('test-calendar-id');
            expect(bookingConfirmation.calendarEventId).toEqual(
              'test-event-id'
            );
            expect(bookingConfirmation.editHash).toEqual('test-edit-hash');
            expect(bookingConfirmation.id).toEqual(123);
            expect(bookingConfirmation.isConfirmed).toBe(false);
            expect(bookingConfirmation.location).toEqual('Earth');
            expect(bookingConfirmation.title).toEqual('Test Booking');
            expect(bookingConfirmation.recipientEmail).toEqual(
              'recipient@example.com'
            );
            expect(bookingConfirmation.recipientLocale).toEqual('en_US');
            expect(bookingConfirmation.recipientName).toEqual('Recipient Doe');
            expect(bookingConfirmation.recipientTz).toEqual('America/New_York');
            expect(bookingConfirmation.endTime).toEqual(
              new Date(1636731958 * 1000)
            );
            expect(bookingConfirmation.startTime).toEqual(
              new Date(1636728347 * 1000)
            );
            done();
          });
      });
    });
  });
});
