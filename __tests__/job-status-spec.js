import fetch from 'node-fetch';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import JobStatus from '../src/models/job-status';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('Job Status', () => {
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
    testContext.listApiResponse = [
      {
        id: 'dcjq3eyd5svm7cnz055tb6cry',
        object: 'calendar',
        account_id: 'abcdfr1iw2tzmp4rr02x789r',
        action: 'create_calendar',
        created_at: 1592374298,
        job_status_id: 'eslvh7ieykvf5yf2xx9k9yrn8',
        status: 'successful',
      },
      {
        id: '2ab73sqyim3poa8qjm4rv0o2',
        object: 'calendar',
        account_id: 'abcw0dfr1iw2tzmp4rr02x789r',
        action: 'delete_calendar',
        created_at: 1592374298,
        job_status_id: '9l1cl6tv6idfp8s4tuvk8saubw',
        status: 'successful',
      },
    ];
    testContext.getApiResponse = {
      id: 'dcjq3eyd5svm7cnz055tb6cry',
      object: 'calendar',
      account_id: 'abcdfr1iw2tzmp4rr02x789r',
      action: 'create_calendar',
      created_at: 1592374298,
      job_status_id: 'eslvh7ieykvf5yf2xx9k9yrn8',
      status: 'successful',
    };
    jest.spyOn(testContext.connection, 'request');
  });

  describe('list job statuses', () => {
    beforeEach(() => {
      const response = {
        status: 200,
        json: () => {
          return Promise.resolve(testContext.listApiResponse);
        },
        headers: new Map(),
      };

      fetch.mockImplementation(() => Promise.resolve(response));
    });

    test('should call API with correct authentication', done => {
      expect.assertions(3);
      const defaultParams = '?offset=0&limit=100';

      return testContext.connection.jobStatuses.list().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/job-statuses' + defaultParams
        );
        expect(options.method).toEqual('GET');
        expect(options.headers['authorization']).toEqual(
          `Basic ${Buffer.from(`${testAccessToken}:`, 'utf8').toString(
            'base64'
          )}`
        );
        done();
      });
    });

    test('should resolve to job status object(s)', done => {
      expect.assertions(8);
      testContext.connection.request = jest.fn(() =>
        Promise.resolve(testContext.listApiResponse)
      );

      testContext.connection.jobStatuses.list().then(data => {
        expect(data[0].object).toBe('calendar');
        expect(data[0].id).toBe('dcjq3eyd5svm7cnz055tb6cry');
        expect(data[0].accountId).toBe('abcdfr1iw2tzmp4rr02x789r');
        expect(data[0].action).toBe('create_calendar');
        expect(data[0].jobStatusId).toBe('eslvh7ieykvf5yf2xx9k9yrn8');
        expect(data[0].status).toBe('successful');
        expect(data[0] instanceof JobStatus).toBe(true);
        expect(data[0].createdAt instanceof Date).toBe(true);
        done();
      });
    });
  });

  describe('find job status', () => {
    beforeEach(() => {
      const response = {
        status: 200,
        json: () => {
          return Promise.resolve(testContext.getApiResponse);
        },
        headers: new Map(),
      };

      fetch.mockImplementation(() => Promise.resolve(response));
    });
    test('should call API with correct authentication', done => {
      expect.assertions(3);

      testContext.connection.jobStatuses.find('a1b2c3').then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/job-statuses/a1b2c3'
        );
        expect(options.method).toEqual('GET');
        expect(options.headers['authorization']).toEqual(
          `Basic ${Buffer.from(`${testAccessToken}:`, 'utf8').toString(
            'base64'
          )}`
        );
        done();
      });
    });

    test('should resolve to job status object', done => {
      expect.assertions(8);
      testContext.connection.request = jest.fn(() =>
        Promise.resolve(testContext.getApiResponse)
      );

      testContext.connection.jobStatuses.find('a1b2c3').then(data => {
        expect(data.object).toBe('calendar');
        expect(data.id).toBe('dcjq3eyd5svm7cnz055tb6cry');
        expect(data.accountId).toBe('abcdfr1iw2tzmp4rr02x789r');
        expect(data.action).toBe('create_calendar');
        expect(data.jobStatusId).toBe('eslvh7ieykvf5yf2xx9k9yrn8');
        expect(data.status).toBe('successful');
        expect(data instanceof JobStatus).toBe(true);
        expect(data.createdAt instanceof Date).toBe(true);
        done();
      });
    });
  });
});
