import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import RestfulModelCollection from '../src/models/restful-model-collection';

describe('RestfulModelCollection', () => {
  let testContext;

  beforeEach(() => {
    Nylas.config({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
    });
    testContext = {};
    testContext.connection = new NylasConnection('test-access-token', {
      clientId: 'foo',
    });
  });

  describe('free-busy', () => {
    test('should fetch free-busy results with snakecase params', () => {
      const params = {
        start_time: '1590454800',
        end_time: '1590780800',
        emails: ['jane@email.com']
      };

      request.Request = jest.fn(options => {
        expect(options.url).toEqual('https://api.nylas.com/calendars/free-busy');
        expect(options.method).toEqual('POST');
        expect(options.body).toEqual({
          start_time: '1590454800',
          end_time: '1590780800',
          emails: [ 'jane@email.com' ]
        });
        expect(options.auth.user).toEqual('test-access-token');
      });

      testContext.connection.calendars.freeBusy(params);
    });

    test('should fetch free-busy results with camelcase params', () => {
      const params = {
        startTime: '1590454800',
        endTime: '1590780800',
        emails: ['jane@email.com']
      };

      request.Request = jest.fn(options => {
        expect(options.url).toEqual('https://api.nylas.com/calendars/free-busy');
        expect(options.method).toEqual('POST');
        expect(options.body).toEqual({
          start_time: '1590454800',
          end_time: '1590780800',
          emails: [ 'jane@email.com' ]
        });
        expect(options.auth.user).toEqual('test-access-token');
      });

      testContext.connection.calendars.freeBusy(params);
    });

  });
});
