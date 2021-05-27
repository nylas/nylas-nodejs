import fetch from 'node-fetch';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import RestfulModelCollection from '../src/models/restful-model-collection';
import { Group } from '../src/models/contact';

describe('RestfulModelCollection', () => {
  let testContext;
  const testAccessToken = 'test-access-token';

  beforeEach(() => {
    Nylas.config({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
    });
    testContext = {};
    testContext.connection = new NylasConnection(testAccessToken, {
      clientId: 'foo',
    });
    testContext.apiResponse = [{
      account_id: 'account123',
      id: 'group123',
      object: 'contact_group',
      name: 'name123',
      path: 'path123'
    }];
  });

  describe('groups', () => {
    test('should call API with correct authentication', done => {
      expect.assertions(3);

      fetch.Request = jest.fn((url, options) => {
        expect(url.toString()).toEqual('https://api.nylas.com/contacts/groups');
        expect(options.method).toEqual('GET');
        expect(options.headers['authorization']).toEqual(`Basic ${Buffer.from(`${testAccessToken}:`, 'utf8').toString('base64')}`);
        done();
      });

      testContext.connection.contacts.groups();
    });

    test('should call callback', done => {
      expect.assertions(7);
      testContext.connection.request = jest.fn(() => Promise.resolve(testContext.apiResponse));

      const testCallback = (err, data) => {
        expect(err).toBe(null);
        expect(data[0].accountId).toBe('account123');
        expect(data[0].id).toBe('group123');
        expect(data[0].object).toBe('contact_group');
        expect(data[0].name).toBe('name123');
        expect(data[0].path).toBe('path123');
        expect(data[0] instanceof Group).toBe(true);
        done();
      };

      testContext.connection.contacts.groups(testCallback);
    });

    test('should resolve to group object', done => {
      expect.assertions(6);
      testContext.connection.request = jest.fn(() => Promise.resolve(testContext.apiResponse));

      testContext.connection.contacts.groups().then(data => {
        expect(data[0].accountId).toBe('account123');
        expect(data[0].id).toBe('group123');
        expect(data[0].object).toBe('contact_group');
        expect(data[0].name).toBe('name123');
        expect(data[0].path).toBe('path123');
        expect(data[0] instanceof Group).toBe(true);
        done();
      });
    });
  });

});
