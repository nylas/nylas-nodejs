import fetch from 'node-fetch';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('CalendarRestfulModelCollection', () => {
  let testContext;
  const testAccessToken = 'test-access-token';

  beforeEach(() => {
    Nylas.config({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
      apiServer: 'https://api.nylas.com',
    });
    testContext = {};
    testContext.connection = new NylasConnection(testAccessToken, {
      clientId: 'myClientId',
    });
    jest.spyOn(testContext.connection, 'request');

    const response = {
      status: 200,
      buffer: () => {
        return Promise.resolve('body');
      },
      json: () => {
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

  const evaluateFreeBusy = () => {
    const options = testContext.connection.request.mock.calls[0][0];
    expect(options.url.toString()).toEqual(
      'https://api.nylas.com/calendars/free-busy'
    );
    expect(options.method).toEqual('POST');
    expect(JSON.parse(options.body)).toEqual({
      start_time: '1590454800',
      end_time: '1590780800',
      emails: ['jane@email.com'],
    });
    expect(options.headers['authorization']).toEqual(
      `Basic ${Buffer.from(`${testAccessToken}:`, 'utf8').toString('base64')}`
    );
  };

  test('[FREE BUSY] should fetch results with snakecase params', done => {
    const params = {
      start_time: '1590454800',
      end_time: '1590780800',
      emails: ['jane@email.com'],
    };

    return testContext.connection.calendars.freeBusy(params).then(() => {
      evaluateFreeBusy();
      done();
    });
  });

  test('[FREE BUSY] should fetch results with camelcase params', done => {
    const params = {
      startTime: '1590454800',
      endTime: '1590780800',
      emails: ['jane@email.com'],
    };

    return testContext.connection.calendars.freeBusy(params).then(() => {
      evaluateFreeBusy();
      done();
    });
  });

  const evaluateAvailability = () => {
    const options = testContext.connection.request.mock.calls[0][0];
    expect(options.url.toString()).toEqual(
      'https://api.nylas.com/calendars/availability'
    );
    expect(options.method).toEqual('POST');
    expect(JSON.parse(options.body)).toEqual({
      start_time: '1590454800',
      end_time: '1590780800',
      interval_minutes: 5,
      duration_minutes: 30,
      emails: ['jane@email.com'],
      free_busy: [],
      open_hours: [
        {
          emails: ['swag@nylas.com'],
          days: ['0'],
          timezone: 'America/Chicago',
          start: '10:00',
          end: '14:00',
          object_type: 'open_hours',
        },
      ],
    });
    expect(options.headers['authorization']).toEqual(
      `Basic ${Buffer.from(`${testAccessToken}:`, 'utf8').toString('base64')}`
    );
  };

  test('[AVAILABILITY] should fetch results with snakecase params', done => {
    const params = {
      start_time: '1590454800',
      end_time: '1590780800',
      interval: 5,
      duration: 30,
      emails: ['jane@email.com'],
      open_hours: [
        {
          emails: ['swag@nylas.com'],
          days: ['0'],
          timezone: 'America/Chicago',
          start: '10:00',
          end: '14:00',
          object_type: 'open_hours',
        },
      ],
    };

    return testContext.connection.calendars.availability(params).then(() => {
      evaluateAvailability();
      done();
    });
  });

  test('[AVAILABILITY] should fetch results with camelcase params', done => {
    const params = {
      startTime: '1590454800',
      endTime: '1590780800',
      interval: 5,
      duration: 30,
      emails: ['jane@email.com'],
      open_hours: [
        {
          emails: ['swag@nylas.com'],
          days: ['0'],
          timezone: 'America/Chicago',
          start: '10:00',
          end: '14:00',
          object_type: 'open_hours',
        },
      ],
    };

    return testContext.connection.calendars.availability(params).then(() => {
      evaluateAvailability();
      done();
    });
  });

  test('[CONSECUTIVE AVAILABILITY] should fetch results with params', done => {
    const params = {
      startTime: 1590454800,
      endTime: 1590780800,
      interval: 5,
      duration: 30,
      emails: [['jane@email.com'], ['swag@nylas.com']],
      free_busy: [
        {
          email: 'jane@email.com',
          object: 'free_busy',
          time_slots: [
            {
              object: 'time_slots',
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
    };

    return testContext.connection.calendars
      .consecutiveAvailability(params)
      .then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/calendars/availability/consecutive'
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
                  object: 'time_slots',
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
        });
        expect(options.headers['authorization']).toEqual(
          `Basic ${Buffer.from(`${testAccessToken}:`, 'utf8').toString(
            'base64'
          )}`
        );
        done();
      });
  });

  test('[CONSECUTIVE AVAILABILITY] should throw error if open hour emails dont match free busy emails', done => {
    const params = {
      startTime: 1590454800,
      endTime: 1590780800,
      interval: 5,
      duration: 30,
      emails: [['jane@email.com']],
      free_busy: [
        {
          email: 'jane@email.com',
          object: 'free_busy',
          time_slots: [
            {
              object: 'time_slots',
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
    };

    expect(() =>
      testContext.connection.calendars.consecutiveAvailability(params)
    ).toThrow();
    done();
  });

  test('[DELETE] should use correct route, method and auth', done => {
    const calendarId = 'id123';

    return testContext.connection.calendars.delete(calendarId).then(() => {
      const options = testContext.connection.request.mock.calls[0][0];
      expect(options.url.toString()).toEqual(
        `https://api.nylas.com/calendars/${calendarId}`
      );
      expect(options.method).toEqual('DELETE');
      expect(options.headers['authorization']).toEqual(
        `Basic ${Buffer.from(`${testAccessToken}:`, 'utf8').toString('base64')}`
      );
      done();
    });
  });
});
