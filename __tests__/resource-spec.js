import fetch from 'node-fetch';

import Nylas from '../src/nylas';
import Resource from '../src/models/resource';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('Resource', () => {
  let testContext;
  const testGrantId = 'test-grant-id';
  const testApiKey = 'test-api-key';

  beforeEach(() => {
    const nylasClient = new Nylas({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
      apiServer: 'https://api.nylas.com',
      apiKey: testApiKey,
    });
    testContext = {};
    testContext.connection = nylasClient.with(testGrantId);
    testContext.apiResponse = [
      {
        object: 'room_resource',
        name: 'training room',
        email: 'training_room@google.com',
      },
      {
        object: 'room_resource',
        name: 'cafeteria',
        email: 'cafeteria@google.com',
      },
    ];

    jest.spyOn(testContext.connection, 'request');

    const response = () => {
      return {
        status: 200,
        text: () => {
          return Promise.resolve(JSON.stringify(testContext.apiResponse));
        },
        headers: new Map(),
      };
    };

    fetch.mockImplementation(() => Promise.resolve(response()));
  });

  describe('list resources', () => {
    test('should call API with correct authentication', done => {
      expect.assertions(3);
      const defaultParams = '?offset=0&limit=100';

      return testContext.connection.resources.list().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          `https://api.nylas.com/grants/${testGrantId}/resources${defaultParams}`
        );
        expect(options.method).toEqual('GET');
        expect(options.headers['authorization']).toEqual(
          `Basic ${Buffer.from(`${testApiKey}:`, 'utf8').toString('base64')}`
        );
        done();
      });
    });

    test('should resolve to resource object(s)', done => {
      expect.assertions(7);

      return testContext.connection.resources.list().then(data => {
        expect(data[0].object).toBe('room_resource');
        expect(data[0].email).toBe('training_room@google.com');
        expect(data[0].name).toBe('training room');
        expect(data[0] instanceof Resource).toBe(true);
        expect(data[1].object).toBe('room_resource');
        expect(data[1].email).toBe('cafeteria@google.com');
        expect(data[1].name).toBe('cafeteria');
        done();
      });
    });
  });
});
