import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import fetch from 'node-fetch';
import Component from '../src/models/component';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('Component', () => {
  let testContext;

  beforeEach(() => {
    Nylas.config({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
      apiServer: 'https://api.nylas.com',
    });
    testContext = {};
    testContext.connection = new NylasConnection('123', {
      clientId: 'myClientId',
    });
    jest.spyOn(testContext.connection, 'request');

    const response = receivedBody => {
      return {
        status: 200,
        text: () => {
          return Promise.resolve(receivedBody);
        },
        json: () => {
          return Promise.resolve(receivedBody);
        },
        headers: new Map(),
      };
    };

    fetch.mockImplementation(req => Promise.resolve(response(req.body)));
    testContext.component = new Component(testContext.connection);
  });

  describe('save', () => {
    test('should do a POST request if the component has no id', done => {
      testContext.component.id = undefined;
      return testContext.component.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/component/myClientId'
        );
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
          id: undefined,
          account_id: undefined,
          object: undefined,
          name: undefined,
          type: undefined,
          action: undefined,
          active: undefined,
          settings: undefined,
          allowed_domains: undefined,
          public_account_id: undefined,
          public_token_id: undefined,
          public_application_id: undefined,
          created_at: undefined,
          updated_at: undefined,
        });
        done();
      });
    });

    test('should do a PUT request if the component has an id', done => {
      testContext.component.id = 'abc-123';
      testContext.component.allowedDomains = ['www.nylas.com'];
      return testContext.component.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/component/myClientId/abc-123'
        );
        expect(options.method).toEqual('PUT');
        expect(JSON.parse(options.body)).toEqual({
          id: undefined,
          account_id: undefined,
          object: undefined,
          name: undefined,
          type: undefined,
          action: undefined,
          active: undefined,
          settings: undefined,
          allowed_domains: ['www.nylas.com'],
          public_account_id: undefined,
          public_token_id: undefined,
          public_application_id: undefined,
          created_at: undefined,
          updated_at: undefined,
        });
        done();
      });
    });
  });

  describe('fetching', () => {
    beforeEach(() => {
      const componentJSON = {
        id: 'abc-123',
        account_id: 'account-123',
        name: 'test-component',
        type: 'agenda',
        action: 0,
        active: true,
        settings: {},
        allowed_domains: [],
        public_account_id: ['account-123'],
        public_token_id: ['token-123'],
        public_application_id: ['application-123'],
        created_at: '2021-08-24T15:05:48.000Z',
        updated_at: '2021-08-24T15:05:48.000Z',
      };

      const response = req => {
        return {
          status: 200,
          text: () => {},
          json: () => {
            if (!req.url.includes('abc-123')) {
              return Promise.resolve([componentJSON]);
            }
            return Promise.resolve(componentJSON);
          },
          headers: new Map(),
        };
      };

      fetch.mockImplementation(req => Promise.resolve(response(req)));
    });

    test('should do a GET request to the correct URL when requesting all components', done => {
      return testContext.connection.component.list().then(componentList => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/component/myClientId?offset=0&limit=100'
        );
        expect(options.method).toEqual('GET');
        expect(componentList.length).toBe(1);
        expect(componentList[0].id).toEqual('abc-123');
        expect(componentList[0].accountId).toEqual('account-123');
        expect(componentList[0].name).toEqual('test-component');
        expect(componentList[0].type).toEqual('agenda');
        expect(componentList[0].action).toBe(0);
        expect(componentList[0].active).toBe(true);
        expect(componentList[0].settings).toEqual({});
        expect(componentList[0].allowedDomains).toEqual([]);
        expect(componentList[0].publicAccountId).toEqual(['account-123']);
        expect(componentList[0].publicTokenId).toEqual(['token-123']);
        expect(componentList[0].publicApplicationId).toEqual([
          'application-123',
        ]);
        expect(componentList[0].createdAt).toEqual(
          new Date('2021-08-24T15:05:48.000Z')
        );
        expect(componentList[0].updatedAt).toEqual(
          new Date('2021-08-24T15:05:48.000Z')
        );
        done();
      });
    });

    test('should do a GET request to the correct URL when requesting a specific component', done => {
      return testContext.connection.component
        .find('abc-123')
        .then(component => {
          const options = testContext.connection.request.mock.calls[0][0];
          expect(options.url.toString()).toEqual(
            'https://api.nylas.com/component/myClientId/abc-123'
          );
          expect(options.method).toEqual('GET');
          expect(component.id).toEqual('abc-123');
          expect(component.accountId).toEqual('account-123');
          expect(component.name).toEqual('test-component');
          expect(component.type).toEqual('agenda');
          expect(component.action).toBe(0);
          expect(component.active).toBe(true);
          expect(component.settings).toEqual({});
          expect(component.allowedDomains).toEqual([]);
          expect(component.publicAccountId).toEqual(['account-123']);
          expect(component.publicTokenId).toEqual(['token-123']);
          expect(component.publicApplicationId).toEqual(['application-123']);
          expect(component.createdAt).toEqual(
            new Date('2021-08-24T15:05:48.000Z')
          );
          expect(component.updatedAt).toEqual(
            new Date('2021-08-24T15:05:48.000Z')
          );
          done();
        });
    });
  });

  describe('delete', () => {
    test('should do a DELETE request to the correct URL when deleting a', done => {
      return testContext.connection.component.delete('abc-123').then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/component/myClientId/abc-123'
        );
        expect(options.method).toEqual('DELETE');
        done();
      });
    });
  });
});
