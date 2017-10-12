import Promise from 'bluebird';
import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';

const testUntil = function(fn) {
  let finished = false;
  runs(() => fn(callback => (finished = true)));
  waitsFor(() => finished);
};

describe('Nylas', function() {
  beforeEach(function() {
    Nylas.appId = undefined;
    Nylas.appSecret = undefined;
    Nylas.apiServer = 'https://api.nylas.com';
    return Promise.onPossiblyUnhandledRejection(function(e, promise) {});
  });

  describe('config', function() {
    it('should allow you to populate the appId, appSecret, apiServer and authServer options', function() {
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

    it('should not override existing values unless new values are provided', function() {
      const newConfig = {
        appId: 'newId',
        appSecret: 'newSecret',
      };

      Nylas.config(newConfig);
      expect(Nylas.appId).toBe(newConfig.appId);
      expect(Nylas.appSecret).toBe(newConfig.appSecret);
      expect(Nylas.apiServer).toBe('https://api.nylas.com');
    });

    it('should throw an exception if the server options do not contain ://', function() {
      const newConfig = {
        appId: 'newId',
        appSecret: 'newSecret',
        apiServer: 'dontknowwhatImdoing.nylas.com',
      };

      expect(() => Nylas.config(newConfig)).toThrow();
    });
  });

  describe('with', function() {
    it('should throw an exception if an access token is not provided', () =>
      expect(() => Nylas.with()).toThrow());

    it('should return an NylasConnection for making requests with the access token', function() {
      Nylas.config({
        appId: 'newId',
        appSecret: 'newSecret',
      });

      const conn = Nylas.with('test-access-token');
      expect(conn instanceof NylasConnection).toEqual(true);
    });
  });

  describe('exchangeCodeForToken', function() {
    beforeEach(() =>
      Nylas.config({
        appId: 'newId',
        appSecret: 'newSecret',
      })
    );

    it('should throw an exception if no code is provided', () =>
      expect(() => Nylas.exchangeCodeForToken()).toThrow());

    it('should throw an exception if the app id and secret have not been configured', function() {
      Nylas.appId = undefined;
      Nylas.appSecret = undefined;
      expect(() => Nylas.exchangeCodeForToken('code-from-server')).toThrow();
    });

    it('should return a promise', function() {
      const p = Nylas.exchangeCodeForToken('code-from-server');
      expect(p instanceof Promise).toBe(true);
    });

    it('should make a request to /oauth/token with the correct grant_type and client params', function() {
      spyOn(request, 'Request').andCallFake(function(options) {
        expect(options.url).toEqual('https://api.nylas.com/oauth/token');
        expect(options.qs).toEqual({
          client_id: 'newId',
          client_secret: 'newSecret',
          grant_type: 'authorization_code',
          code: 'code-from-server',
        });
      });
      return Nylas.exchangeCodeForToken('code-from-server');
    });

    it('should resolve with the returned access_token', function() {
      spyOn(request, 'Request').andCallFake(options =>
        options.callback(null, null, { access_token: '12345' })
      );

      testUntil(function(done) {
        let p;
        return (p = Nylas.exchangeCodeForToken(
          'code-from-server'
        ).then(function(accessToken) {
          expect(accessToken).toEqual('12345');
          done();
        }));
      });
    });

    it('should reject with the request error', function() {
      const error = new Error('network error');
      spyOn(request, 'Request').andCallFake(options =>
        options.callback(error, null, null)
      );

      testUntil(function(done) {
        let p;
        return (p = Nylas.exchangeCodeForToken(
          'code-from-server'
        ).catch(function(returnedError) {
          expect(returnedError).toBe(error);
          done();
        }));
      });
    });

    describe('when provided an optional callback', function() {
      it('should call it with the returned access_token', function() {
        spyOn(request, 'Request').andCallFake(options =>
          options.callback(null, null, { access_token: '12345' })
        );
        testUntil(done =>
          Nylas.exchangeCodeForToken('code-from-server', function(
            returnedError,
            accessToken
          ) {
            expect(accessToken).toBe('12345');
            done();
          })
        );
      });

      it('should call it with the request error', function() {
        const error = new Error('network error');
        spyOn(request, 'Request').andCallFake(options =>
          options.callback(error, null, null)
        );

        testUntil(done =>
          Nylas.exchangeCodeForToken('code-from-server', function(
            returnedError,
            accessToken
          ) {
            expect(returnedError).toBe(error);
            done();
          })
        );
      });
    });
  });

  describe('urlForAuthentication', function() {
    beforeEach(() =>
      Nylas.config({
        appId: 'newId',
        appSecret: 'newSecret',
      })
    );

    it('should require a redirectURI', () =>
      expect(() => Nylas.urlForAuthentication()).toThrow());

    it('should throw an exception if the app id has not been configured', function() {
      Nylas.appId = undefined;
      const options = { redirectURI: 'https://localhost/callback' };
      expect(() => Nylas.urlForAuthentication(options)).toThrow();
    });

    it('should not throw an exception if the app secret has not been configured', function() {
      Nylas.appSecret = undefined;
      const options = { redirectURI: 'https://localhost/callback' };
      expect(Nylas.urlForAuthentication(options)).toEqual(
        'https://api.nylas.com/oauth/authorize?client_id=newId&trial=false&response_type=code&scope=email&login_hint=&redirect_uri=https://localhost/callback'
      );
    });

    it('should generate the correct authentication URL', function() {
      const options = { redirectURI: 'https://localhost/callback' };
      expect(Nylas.urlForAuthentication(options)).toEqual(
        'https://api.nylas.com/oauth/authorize?client_id=newId&trial=false&response_type=code&scope=email&login_hint=&redirect_uri=https://localhost/callback'
      );
    });

    it('should use a login hint when provided in the options', function() {
      const options = {
        loginHint: 'ben@nylas.com',
        redirectURI: 'https://localhost/callback',
      };
      expect(Nylas.urlForAuthentication(options)).toEqual(
        'https://api.nylas.com/oauth/authorize?client_id=newId&trial=false&response_type=code&scope=email&login_hint=ben@nylas.com&redirect_uri=https://localhost/callback'
      );
    });

    it('should use trial = true when provided in the options', function() {
      const options = {
        loginHint: 'ben@nylas.com',
        redirectURI: 'https://localhost/callback',
        trial: true,
      };
      expect(Nylas.urlForAuthentication(options)).toEqual(
        'https://api.nylas.com/oauth/authorize?client_id=newId&trial=true&response_type=code&scope=email&login_hint=ben@nylas.com&redirect_uri=https://localhost/callback'
      );
    });
  });
});
