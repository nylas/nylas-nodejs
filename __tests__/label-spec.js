import { Label } from '../src/models/folder';
import fetch from 'node-fetch';
import Nylas from '../src/nylas';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('Label', () => {
  let testContext;
  const testGrantId = '123'
  beforeEach(() => {
    const nylasClient = new Nylas({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
      apiServer: 'https://api.nylas.com',
    });
    testContext = {};
    testContext.connection = nylasClient.with(testGrantId);
    jest.spyOn(testContext.connection, 'request');

    const response = receivedBody => {
      return {
        status: 200,
        text: () => {
          return Promise.resolve(JSON.stringify(receivedBody));
        },
        headers: new Map(),
      };
    };

    fetch.mockImplementation(req => Promise.resolve(response(req.body)));
    testContext.label = new Label(testContext.connection);
    testContext.label.displayName = 'Label name';
    testContext.label.name = 'Longer label name';
  });

  describe('save', () => {
    test('should do a POST request if id is undefined', done => {
      return testContext.label.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(`https://api.nylas.com/grants/${testGrantId}/labels`);
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
          display_name: 'Label name',
        });
        done();
      });
    });

    test('should do a PUT if id is defined', done => {
      testContext.label.id = 'label_id';
      return testContext.label.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          `https://api.nylas.com/grants/${testGrantId}/labels/label_id`
        );
        expect(options.method).toEqual('PUT');
        expect(JSON.parse(options.body)).toEqual({
          display_name: 'Label name',
        });
        done();
      });
    });
  });
});
