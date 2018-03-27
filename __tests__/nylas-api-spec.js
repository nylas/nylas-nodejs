import Promise from 'bluebird';
import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';

describe('Nylas', () => {
  beforeEach(() => {
    Nylas.appId = undefined;
    Nylas.appSecret = undefined;
    Nylas.apiServer = 'https://api.nylas.com';
    return Promise.onPossiblyUnhandledRejection((e, promise) => {});
  });

  describe('config', () => {
    test('should allow you to populate the appId, appSecret, apiServer and authServer options', () => {
      const newConfig = {
        appId: 'newId',
        appSecret: 'newSecret',
        apiServer: 'https://api-staging.nylas.com/',
      };

      Nylas.config(newConfig);
      expect(Nylas.appId).toBe(newConfig.appId);
      expect(Nylas.appSecret).toBe(newConfig.appSecret);
      expect(Nylas.apiServer).toBe(newConfig.apiServer);
    });

    test('should not override existing values unless new values are provided', () => {
      const newConfig = {
        appId: 'newId',
        appSecret: 'newSecret',
      };

      Nylas.config(newConfig);
      expect(Nylas.appId).toBe(newConfig.appId);
      expect(Nylas.appSecret).toBe(newConfig.appSecret);
      expect(Nylas.apiServer).toBe('https://api.nylas.com');
    });

    test('should throw an exception if the server options do not contain ://', () => {
      const newConfig = {
        appId: 'newId',
        appSecret: 'newSecret',
        apiServer: 'dontknowwhatImdoing.nylas.com',
      };

      expect(() => Nylas.config(newConfig)).toThrow();
    });
  });

  describe('with', () => {
    test('should throw an exception if an access token is not provided', () =>
      expect(() => Nylas.with()).toThrow());

    test('should return an NylasConnection for making requests with the access token', () => {
      Nylas.config({
        appId: 'newId',
        appSecret: 'newSecret',
      });

      const conn = Nylas.with('test-access-token');
      expect(conn instanceof NylasConnection).toEqual(true);
    });
  });

  describe('exchangeCodeForToken', () => {
    beforeEach(() =>
      Nylas.config({
        appId: 'newId',
        appSecret: 'newSecret',
      })
    );

    test('should throw an exception if no code is provided', () =>
      expect(() => Nylas.exchangeCodeForToken()).toThrow());

    test('should throw an exception if the app id and secret have not been configured', () => {
      Nylas.appId = undefined;
      Nylas.appSecret = undefined;
      expect(() => Nylas.exchangeCodeForToken('code-from-server')).toThrow();
    });

    test('should return a promise', () => {
      const p = Nylas.exchangeCodeForToken('code-from-server');
      expect(p instanceof Promise).toBe(true);
    });

    test('should make a request to /oauth/token with the correct grant_type and client params', () => {
      request.Request = jest.fn(options => {
        expect(options.url).toEqual('https://api.nylas.com/oauth/token');
        expect(options.qs).toEqual({
          client_id: 'newId',
          client_secret: 'newSecret',
          grant_type: 'authorization_code',
          code: 'code-from-server',
        });
      });
      Nylas.exchangeCodeForToken('code-from-server');
    });

    test('should resolve with the returned access_token', done => {
      request.Request = jest.fn(options =>
        options.callback(null, null, { access_token: '12345' })
      );

      Nylas.exchangeCodeForToken('code-from-server').then(accessToken => {
        expect(accessToken).toEqual('12345');
        done();
      });
    });

    test('should reject with the request error', done => {
      const error = new Error('network error');
      request.Request = jest.fn(options => options.callback(error, null, null));

      Nylas.exchangeCodeForToken('code-from-server').catch(returnedError => {
        expect(returnedError).toBe(error);
        done();
      });
    });

    describe('when provided an optional callback', () => {
      test('should call it with the returned access_token', done => {
        request.Request = jest.fn(options =>
          options.callback(null, null, { access_token: '12345' })
        );
        Nylas.exchangeCodeForToken(
          'code-from-server',
          (returnedError, accessToken) => {
            expect(accessToken).toBe('12345');
            done();
          }
        );
      });

      test('should call it with the request error', done => {
        const error = new Error('network error');
        request.Request = jest.fn(options =>
          options.callback(error, null, null)
        );

        Nylas.exchangeCodeForToken(
          'code-from-server',
          (returnedError, accessToken) => {
            expect(returnedError).toBe(error);
            done();
          }
        );
      });
    });
  });

  describe('urlForAuthentication', () => {
    beforeEach(() =>
      Nylas.config({
        appId: 'newId',
        appSecret: 'newSecret',
      })
    );

    test('should require a redirectURI', () =>
      expect(() => Nylas.urlForAuthentication()).toThrow());

    test('should throw an exception if the app id has not been configured', () => {
      Nylas.appId = undefined;
      const options = { redirectURI: 'https://localhost/callback' };
      expect(() => Nylas.urlForAuthentication(options)).toThrow();
    });

    test('should not throw an exception if the app secret has not been configured', () => {
      Nylas.appSecret = undefined;
      const options = { redirectURI: 'https://localhost/callback' };
      expect(Nylas.urlForAuthentication(options)).toEqual(
        'https://api.nylas.com/oauth/authorize?client_id=newId&response_type=code&login_hint=&redirect_uri=https://localhost/callback'
      );
    });

    test('should generate the correct authentication URL', () => {
      const options = { redirectURI: 'https://localhost/callback' };
      expect(Nylas.urlForAuthentication(options)).toEqual(
        'https://api.nylas.com/oauth/authorize?client_id=newId&response_type=code&login_hint=&redirect_uri=https://localhost/callback'
      );
    });

    test('should use a login hint when provided in the options', () => {
      const options = {
        loginHint: 'ben@nylas.com',
        redirectURI: 'https://localhost/callback',
      };
      expect(Nylas.urlForAuthentication(options)).toEqual(
        'https://api.nylas.com/oauth/authorize?client_id=newId&response_type=code&login_hint=ben@nylas.com&redirect_uri=https://localhost/callback'
      );
    });

    test('should add scopes when provided in the options', () => {
      const options = {
        loginHint: 'test@nylas.com',
        redirectURI: 'https://localhost/callback',
        scopes: ['calendar', 'contacts'],
      };
      expect(Nylas.urlForAuthentication(options)).toEqual(
        'https://api.nylas.com/oauth/authorize?client_id=newId&response_type=code&login_hint=test@nylas.com&redirect_uri=https://localhost/callback&scopes=calendar,contacts'
      );
    });
  });
});
