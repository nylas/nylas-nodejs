import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Resource from '../src/models/resource';

describe('Resource', () => {
  let testContext;

  beforeEach(() => {
    Nylas.config({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
    });
    testContext = {};
    testContext.connection = new NylasConnection('test-access-token', {
      clientId: 'myClientId',
    });
    testContext.apiResponse = [{
      object: 'room_resource',
      name: 'training room',
      email: 'training_room@google.com'
    }, {
      object: 'room_resource',
      name: 'cafeteria',
      email: 'cafeteria@google.com'
    }];
  });

  describe('list resources', () => {
    test('should call API with correct authentication', done => {
      expect.assertions(3);

      request.Request = jest.fn(options => {
        expect(options.url).toEqual('https://api.nylas.com/resources');
        expect(options.method).toEqual('GET');
        expect(options.auth.user).toEqual('test-access-token');
        done();
      });

      testContext.connection.resources.list();
    });

    test('should resolve to resource object(s)', done => {
      expect.assertions(7);
      testContext.connection.request = jest.fn(() => Promise.resolve(testContext.apiResponse));

      testContext.connection.resources.list().then(data => {
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
