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

  test('[FREE BUSY] should fetch results with snakecase params', () => {
    const params = {
      start_time: '1590454800',
      end_time: '1590780800',
      emails: ['jane@email.com'],
    };

    return testContext.connection.calendars
      .freeBusy(params)
      .then(evaluateFreeBusy);
  });

  test('[FREE BUSY] should fetch results with camelcase params', () => {
    const params = {
      startTime: '1590454800',
      endTime: '1590780800',
      emails: ['jane@email.com'],
    };

    return testContext.connection.calendars
      .freeBusy(params)
      .then(evaluateFreeBusy);
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
