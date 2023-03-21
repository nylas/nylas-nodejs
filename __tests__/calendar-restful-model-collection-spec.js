import fetch from 'node-fetch';

import Nylas from '../src/nylas';
import { Days, RoundRobin } from '../src/models/calendar-availability';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('CalendarRestfulModelCollection', () => {
  let testContext;
  const testGrantId = 'test-grant-id';
  const testApiKey = 'test-api-key';

  beforeEach(() => {
    const nylasClient = new Nylas({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
      apiServer: 'https://api.nylas.com',
      apiKey:testApiKey
    });
    testContext = {};
    testContext.connection = nylasClient.with(testGrantId);
    jest.spyOn(testContext.connection, 'request');

    const response = {
      status: 200,
      text: () => {
        return Promise.resolve(
          JSON.stringify({
            body: 'body',
          })
        );
      },
      headers: new Map(),
    };

    fetch.mockImplementation(() => Promise.resolve(response));
  });

  test('[DELETE] should use correct route, method and auth', done => {
    const calendarId = 'id123';

    return testContext.connection.calendars.delete(calendarId).then(() => {
      const options = testContext.connection.request.mock.calls[0][0];
      expect(options.url.toString()).toEqual(
        `https://api.nylas.com/grants/${testGrantId}/calendars/${calendarId}`
      );
      expect(options.method).toEqual('DELETE');
      expect(options.headers['authorization']).toEqual(
        `Basic ${Buffer.from(`${testApiKey}:`, 'utf8').toString('base64')}`
      );
      done();
    });
  });

  describe('Free Busy', () => {
    test('Should fetch results with params', done => {
      const response = {
        status: 200,
        text: () => {
          return Promise.resolve(
            JSON.stringify([
              {
                object: 'free_busy',
                email: 'jane@email.com',
                time_slots: [
                  {
                    object: 'time_slot',
                    status: 'busy',
                    start_time: 1590454800,
                    end_time: 1590780800,
                    capacity: {
                      event_id: 'abc-123',
                      current_capacity: 2,
                      max_capacity: 5,
                    },
                  },
                ],
              },
            ])
          );
        },
        headers: new Map(),
      };
      fetch.mockImplementation(() => Promise.resolve(response));

      const params = {
        startTime: 1590454800,
        endTime: 1590780800,
        emails: ['jane@email.com'],
        calendars: [
          {
            accountId: 'test_account_id',
            calendarIds: ['example_calendar_id_A', 'example_calendar_id_B'],
          },
        ],
      };

      return testContext.connection.calendars
        .freeBusy(params)
        .then(freeBusy => {
          const options = testContext.connection.request.mock.calls[0][0];
          expect(options.url.toString()).toEqual(
            `https://api.nylas.com/grants/${testGrantId}/calendars/free-busy`
          );
          expect(options.method).toEqual('POST');
          expect(JSON.parse(options.body)).toEqual({
            start_time: '1590454800',
            end_time: '1590780800',
            emails: ['jane@email.com'],
            calendars: [
              {
                account_id: 'test_account_id',
                calendar_ids: [
                  'example_calendar_id_A',
                  'example_calendar_id_B',
                ],
              },
            ],
          });
          expect(options.headers['authorization']).toEqual(
            `Basic ${Buffer.from(`${testApiKey}:`, 'utf8').toString(
              'base64'
            )}`
          );
          expect(freeBusy.length).toEqual(1);
          freeBusy = freeBusy[0];
          expect(freeBusy.object).toEqual('free_busy');
          expect(freeBusy.email).toEqual('jane@email.com');
          expect(freeBusy.timeSlots.length).toEqual(1);
          const timeSlots = freeBusy.timeSlots[0];
          expect(timeSlots.object).toEqual('time_slot');
          expect(timeSlots.status).toEqual('busy');
          expect(timeSlots.startTime).toEqual(1590454800);
          expect(timeSlots.endTime).toEqual(1590780800);
          expect(timeSlots.capacity.eventId).toEqual('abc-123');
          expect(timeSlots.capacity.currentCapacity).toEqual(2);
          expect(timeSlots.capacity.maxCapacity).toEqual(5);
          done();
        });
    });

    test('Should throw error if neither emails or calendars are passed in', done => {
      const params = {
        startTime: 1590454800,
        endTime: 1590780800,
      };

      expect(() => testContext.connection.calendars.freeBusy(params)).toThrow();
      done();
    });
  });

  describe('Availability', () => {
    test('Should fetch results with params', done => {
      const params = {
        startTime: 1590454800,
        endTime: 1590780800,
        interval: 5,
        duration: 30,
        emails: ['jane@email.com'],
        roundRobin: RoundRobin.MaxAvailability,
        openHours: [
          {
            emails: ['swag@nylas.com'],
            days: [Days.Sunday],
            timezone: 'America/Chicago',
            start: '10:00',
            end: '14:00',
          },
        ],
        calendars: [
          {
            accountId: 'test_account_id',
            calendarIds: ['example_calendar_id_A', 'example_calendar_id_B'],
          },
        ],
      };

      return testContext.connection.calendars.availability(params).then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          `https://api.nylas.com/grants/${testGrantId}/calendars/availability`
        );
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
          start_time: 1590454800,
          end_time: 1590780800,
          interval_minutes: 5,
          duration_minutes: 30,
          emails: ['jane@email.com'],
          round_robin: 'max-availability',
          free_busy: [],
          open_hours: [
            {
              emails: ['swag@nylas.com'],
              days: [0],
              timezone: 'America/Chicago',
              start: '10:00',
              end: '14:00',
              object_type: 'open_hours',
            },
          ],
          calendars: [
            {
              account_id: 'test_account_id',
              calendar_ids: ['example_calendar_id_A', 'example_calendar_id_B'],
            },
          ],
        });
        expect(options.headers['authorization']).toEqual(
          `Basic ${Buffer.from(`${testApiKey}:`, 'utf8').toString(
            'base64'
          )}`
        );
        done();
      });
    });

    test('Should throw error if neither emails or calendars are passed in', done => {
      const params = {
        startTime: 1590454800,
        endTime: 1590780800,
        interval: 5,
        duration: 30,
      };

      expect(() =>
        testContext.connection.calendars.availability(params)
      ).toThrow();
      done();
    });
  });

  describe('Consecutive Availability', () => {
    test('Should fetch results with params', done => {
      const params = {
        startTime: 1590454800,
        endTime: 1590780800,
        interval: 5,
        duration: 30,
        emails: [['jane@email.com'], ['swag@nylas.com']],
        freeBusy: [
          {
            email: 'jane@email.com',
            timeSlots: [
              {
                status: 'busy',
                startTime: 1590454800,
                endTime: 1590780800,
              },
            ],
          },
        ],
        openHours: [
          {
            emails: ['jane@email.com', 'swag@nylas.com'],
            days: [Days.Sunday],
            timezone: 'America/Chicago',
            start: '10:00',
            end: '14:00',
          },
        ],
        calendars: [
          {
            accountId: 'test_account_id',
            calendarIds: ['example_calendar_id_A', 'example_calendar_id_B'],
          },
        ],
      };

      return testContext.connection.calendars
        .consecutiveAvailability(params)
        .then(() => {
          const options = testContext.connection.request.mock.calls[0][0];
          expect(options.url.toString()).toEqual(
            `https://api.nylas.com/grants/${testGrantId}/calendars/availability/consecutive`
          );
          expect(options.method).toEqual('POST');
          expect(JSON.parse(options.body)).toEqual({
            start_time: 1590454800,
            end_time: 1590780800,
            interval_minutes: 5,
            duration_minutes: 30,
            emails: [['jane@email.com'], ['swag@nylas.com']],
            free_busy: [
              {
                email: 'jane@email.com',
                object: 'free_busy',
                time_slots: [
                  {
                    object: 'time_slot',
                    status: 'busy',
                    start_time: 1590454800,
                    end_time: 1590780800,
                  },
                ],
              },
            ],
            open_hours: [
              {
                emails: ['jane@email.com', 'swag@nylas.com'],
                days: [0],
                timezone: 'America/Chicago',
                start: '10:00',
                end: '14:00',
                object_type: 'open_hours',
              },
            ],
            calendars: [
              {
                account_id: 'test_account_id',
                calendar_ids: [
                  'example_calendar_id_A',
                  'example_calendar_id_B',
                ],
              },
            ],
          });
          expect(options.headers['authorization']).toEqual(
            `Basic ${Buffer.from(`${testApiKey}:`, 'utf8').toString(
              'base64'
            )}`
          );
          done();
        });
    });

    test('Should throw error if open hour emails dont match free busy emails', done => {
      const params = {
        startTime: 1590454800,
        endTime: 1590780800,
        interval: 5,
        duration: 30,
        emails: [['jane@email.com']],
        freeBusy: [
          {
            email: 'jane@email.com',
            timeSlots: [
              {
                status: 'busy',
                startTime: 1590454800,
                endTime: 1590780800,
              },
            ],
          },
        ],
        openHours: [
          {
            emails: ['jane@email.com', 'swag@nylas.com'],
            days: [Days.Sunday],
            timezone: 'America/Chicago',
            start: '10:00',
            end: '14:00',
          },
        ],
      };

      expect(() =>
        testContext.connection.calendars.consecutiveAvailability(params)
      ).toThrow();
      done();
    });

    test('Should throw error if neither emails or calendars are passed in', done => {
      const params = {
        startTime: 1590454800,
        endTime: 1590780800,
        interval: 5,
        duration: 30,
      };

      expect(() =>
        testContext.connection.calendars.consecutiveAvailability(params)
      ).toThrow();
      done();
    });
  });
});
