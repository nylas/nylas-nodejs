import fetch from 'node-fetch';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import RestfulModelCollection from '../src/models/restful-model-collection';

jest.useFakeTimers();

describe('CalendarRestfulModelCollection', () => {
  let testContext;
  const testAccessToken = 'test-access-token';

  beforeEach(() => {
    Nylas.config({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
    });
    testContext = {};
    testContext.connection = new NylasConnection(testAccessToken, {
      clientId: 'myClientId',
    });
  });

  test('[FREE BUSY] should fetch results with snakecase params', () => {
    const params = {
      start_time: '1590454800',
      end_time: '1590780800',
      emails: ['jane@email.com']
    };

    fetch.Request = jest.fn((url, options) => {
      expect(url.toString()).toEqual('https://api.nylas.com/calendars/free-busy');
      expect(options.method).toEqual('POST');
      expect(JSON.parse(options.body)).toEqual({
        start_time: '1590454800',
        end_time: '1590780800',
        emails: [ 'jane@email.com' ]
      });
      expect(options.headers['authorization']).toEqual(`Basic ${Buffer.from(`${testAccessToken}:`, 'utf8').toString('base64')}`);
    });

    testContext.connection.calendars.freeBusy(params);
  });

  test('[FREE BUSY] should fetch results with camelcase params', () => {
    const params = {
      startTime: '1590454800',
      endTime: '1590780800',
      emails: ['jane@email.com']
    };

    fetch.Request = jest.fn((url, options) => {
      expect(url.toString()).toEqual('https://api.nylas.com/calendars/free-busy');
      expect(options.method).toEqual('POST');
      expect(JSON.parse(options.body)).toEqual({
        start_time: '1590454800',
        end_time: '1590780800',
        emails: [ 'jane@email.com' ]
      });
      expect(options.headers['authorization']).toEqual(`Basic ${Buffer.from(`${testAccessToken}:`, 'utf8').toString('base64')}`);
    });

    testContext.connection.calendars.freeBusy(params);
  });

  test('[AVAILABILITY] should fetch results with snakecase params', () => {
    const params = {
      start_time: '1590454800',
      end_time: '1590780800',
      interval: 5,
      duration: 30,
      emails: ['jane@email.com'],
      open_hours: [{
        emails: [
          "swag@nylas.com"
        ],
        days: [
          "0"
        ],
        timezone: "America/Chicago",
        start: "10:00",
        end: "14:00",
        object_type: "open_hours"
      }]
    };

    fetch.Request = jest.fn((url, options) => {
      expect(url.toString()).toEqual('https://api.nylas.com/calendars/availability');
      expect(options.method).toEqual('POST');
      expect(JSON.parse(options.body)).toEqual({
        start_time: '1590454800',
        end_time: '1590780800',
        interval_minutes: 5,
        duration_minutes: 30,
        emails: [ 'jane@email.com' ],
        free_busy: [],
        open_hours: [{
          emails: [
            "swag@nylas.com"
          ],
          days: [
            "0"
          ],
          timezone: "America/Chicago",
          start: "10:00",
          end: "14:00",
          object_type: "open_hours"
        }]
      });
      expect(options.headers['authorization']).toEqual(`Basic ${Buffer.from(`${testAccessToken}:`, 'utf8').toString('base64')}`);
    });

    testContext.connection.calendars.availability(params);
  });

  test('[AVAILABILITY] should fetch results with camelcase params', () => {
    const params = {
      startTime: '1590454800',
      endTime: '1590780800',
      interval: 5,
      duration: 30,
      emails: ['jane@email.com'],
      open_hours: [{
        emails: [
          "swag@nylas.com"
        ],
        days: [
          "0"
        ],
        timezone: "America/Chicago",
        start: "10:00",
        end: "14:00",
        object_type: "open_hours"
      }]
    };

    fetch.Request = jest.fn((url, options) => {
      expect(url.toString()).toEqual('https://api.nylas.com/calendars/availability');
      expect(options.method).toEqual('POST');
      expect(JSON.parse(options.body)).toEqual({
        start_time: '1590454800',
        end_time: '1590780800',
        interval_minutes: 5,
        duration_minutes: 30,
        emails: [ 'jane@email.com' ],
        free_busy: [],
        open_hours: [{
          emails: [
            "swag@nylas.com"
          ],
          days: [
            "0"
          ],
          timezone: "America/Chicago",
          start: "10:00",
          end: "14:00",
          object_type: "open_hours"
        }]
      });
      expect(options.headers['authorization']).toEqual(`Basic ${Buffer.from(`${testAccessToken}:`, 'utf8').toString('base64')}`);
    });

    testContext.connection.calendars.availability(params);
  });

  test('[DELETE] should use correct route, method and auth', done => {
    expect.assertions(3);
    const calendarId = 'id123';
    fetch.Request = jest.fn((url, options) => {
      expect(url.toString()).toEqual(`https://api.nylas.com/calendars/${calendarId}`);
      expect(options.method).toEqual('DELETE');
      expect(options.headers['authorization']).toEqual(`Basic ${Buffer.from(`${testAccessToken}:`, 'utf8').toString('base64')}`);
    });

    testContext.connection.calendars.delete(calendarId);
    done();
  });

});
