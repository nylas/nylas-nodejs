import NylasConnection from '../src/nylas-connection';
import Calendar from '../src/models/calendar';
import fetch from 'node-fetch';
import Nylas from '../src/nylas';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('Calendar', () => {
  let testContext;

  beforeEach(() => {
    Nylas.config({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
      apiServer: 'https://api.nylas.com',
    });
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
    const calendarJSON = {
      account_id: 'eof2wrhqkl7kdwhy9hylpv9o9',
      description: 'All the holidays',
      id: '8e570s302fdazx9zqwiuk9jqn',
      is_primary: false,
      job_status_id: '48pp6ijzrxpw9jors9ylnsxnf',
      location: 'Santa Monica, CA',
      name: 'Holidays',
      object: 'calendar',
      read_only: false,
      timezone: 'America/Los_Angeles',
    };
    jest.spyOn(testContext.connection, 'request');

    const response = receivedBody => {
      return {
        status: 200,
        buffer: () => {
          return Promise.resolve('body');
        },
        json: () => {
          if (receivedBody === null) {
            return Promise.resolve(calendarJSON);
          }

          const j = JSON.parse(receivedBody.toString());
          if (!j.id) {
            j.id = calendarJSON.id;
          }
          return Promise.resolve(j);
        },
        headers: new Map(),
      };
    };

    fetch.mockImplementation(req => Promise.resolve(response(req.body)));
    testContext.calendar = new Calendar(testContext.connection, calendarJSON);
  });

  const sharedCalendarEvaluation = calendar => {
    expect(calendar.id).toEqual('8e570s302fdazx9zqwiuk9jqn');
    expect(calendar.accountId).toEqual('eof2wrhqkl7kdwhy9hylpv9o9');
    expect(calendar.isPrimary).toEqual(false);
    expect(calendar.location).toEqual('Santa Monica, CA');
    expect(calendar.name).toEqual('Holidays');
    expect(calendar.object).toEqual('calendar');
    expect(calendar.timezone).toEqual('America/Los_Angeles');
    expect(calendar.readOnly).toEqual(false);
    expect(calendar.jobStatusId).toEqual('48pp6ijzrxpw9jors9ylnsxnf');
  };

  test('[SAVE] should do a POST request if the calendar has no id', done => {
    expect.assertions(13);
    testContext.calendar.id = undefined;
    testContext.calendar.save().then(calendar => {
      const options = testContext.connection.request.mock.calls[0][0];
      expect(options.url.toString()).toEqual('https://api.nylas.com/calendars');
      expect(options.method).toEqual('POST');
      expect(JSON.parse(options.body)).toEqual({
        name: 'Holidays',
        description: 'All the holidays',
        location: 'Santa Monica, CA',
        timezone: 'America/Los_Angeles',
      });
      sharedCalendarEvaluation(calendar);
      expect(calendar.description).toEqual('All the holidays');
      done();
    });
  });

  test('[SAVE] should do a PUT request if the event has an id', done => {
    expect.assertions(13);
    testContext.calendar.id = '8e570s302fdazx9zqwiuk9jqn';
    testContext.calendar.description = 'Updated description';
    testContext.calendar.metadata = {
      key: 'value',
    };
    testContext.calendar.save().then(calendar => {
      const options = testContext.connection.request.mock.calls[0][0];
      expect(options.url.toString()).toEqual(
        'https://api.nylas.com/calendars/8e570s302fdazx9zqwiuk9jqn'
      );
      expect(options.method).toEqual('PUT');
      expect(JSON.parse(options.body)).toEqual({
        name: 'Holidays',
        description: 'Updated description',
        location: 'Santa Monica, CA',
        timezone: 'America/Los_Angeles',
        metadata: {
          key: 'value',
        },
      });
      sharedCalendarEvaluation(calendar);
      expect(calendar.description).toEqual('Updated description');
      done();
    });
  });

  test('[FIND] should use correct method and route', done => {
    expect.assertions(12);
    testContext.connection.calendars
      .find('8e570s302fdazx9zqwiuk9jqn')
      .then(calendar => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/calendars/8e570s302fdazx9zqwiuk9jqn'
        );
        expect(options.method).toEqual('GET');
        expect(options.body).toBeUndefined();
        sharedCalendarEvaluation(calendar);
        done();
      });
  });

  test('[GET job status] should use correct method and route', done => {
    expect.assertions(3);
    testContext.calendar.getJobStatus().then(() => {
      const options = testContext.connection.request.mock.calls[0][0];
      expect(options.url.toString()).toEqual(
        'https://api.nylas.com/job-statuses/48pp6ijzrxpw9jors9ylnsxnf'
      );
      expect(options.method).toEqual('GET');
      expect(options.body).toBeUndefined();
      done();
    });
  });

  test('[GET job status] should error without job status id', done => {
    expect.assertions(1);
    const error = new Error('jobStatusId must be defined');
    testContext.calendar.jobStatusId = undefined;
    testContext.calendar.getJobStatus().catch(err => {
      expect(err).toEqual(error);
      done();
    });
  });
});
