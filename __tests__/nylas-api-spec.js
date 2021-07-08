jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

// TODO since node 10 URL is global
import { URL } from 'url';
import fetch, { Response } from 'node-fetch';
import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';

describe('Nylas', () => {
  beforeEach(() => {
    Nylas.clientId = undefined;
    Nylas.clientSecret = undefined;
    Nylas.apiServer = 'https://api.nylas.com';

    fetch.mockImplementation(() =>
      Promise.resolve(new Response('{"access_token":"12345"}'))
    );
  });

  describe('config', () => {
    test('should allow you to populate the clientId, clientSecret, apiServer and authServer options', () => {
      const newConfig = {
        clientId: 'newId',
        clientSecret: 'newSecret',
        apiServer: 'https://api-staging.nylas.com/',
      };

      Nylas.config(newConfig);
      expect(Nylas.clientId).toBe(newConfig.clientId);
      expect(Nylas.clientSecret).toBe(newConfig.clientSecret);
      expect(Nylas.apiServer).toBe(newConfig.apiServer);
    });

    test('should not override existing values unless new values are provided', () => {
      const newConfig = {
        clientId: 'newId',
        clientSecret: 'newSecret',
      };

      Nylas.config(newConfig);
      expect(Nylas.clientId).toBe(newConfig.clientId);
      expect(Nylas.clientSecret).toBe(newConfig.clientSecret);
      expect(Nylas.apiServer).toBe('https://api.nylas.com');
    });

    test('should throw an exception if the server options do not contain ://', () => {
      const newConfig = {
        clientId: 'newId',
        clientSecret: 'newSecret',
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
        clientId: 'newId',
        clientSecret: 'newSecret',
      });

      const conn = Nylas.with('test-access-token');
      expect(conn instanceof NylasConnection).toEqual(true);
    });
  });

  describe('exchangeCodeForToken', () => {
    beforeEach(() =>
      Nylas.config({
        clientId: 'newId',
        clientSecret: 'newSecret',
      })
    );

    test('should throw an exception if no code is provided', () =>
      expect(() => Nylas.exchangeCodeForToken()).toThrow());

    test('should throw an exception if the client id and secret have not been configured', () => {
      Nylas.clientId = undefined;
      Nylas.clientSecret = undefined;
      expect(() => Nylas.exchangeCodeForToken('code-from-server')).toThrow(
        'cannot be called until you provide a clientId and secret'
      );
    });

    test('should return a promise', () => {
      const p = Nylas.exchangeCodeForToken('code-from-server');
      expect(p).toBeInstanceOf(Promise);
    });

    test('should make a request to /oauth/token with the correct grant_type and client params', async () => {
      await Nylas.exchangeCodeForToken('code-from-server');
      const search =
        'client_id=newId&client_secret=newSecret&grant_type=authorization_code&code=code-from-server';
      const url = new URL(`https://api.nylas.com/oauth/token?${search}`);
      expect(fetch).lastCalledWith(url);
    });

    test('should resolve with the returned access_token', async () => {
      const accessToken = await Nylas.exchangeCodeForToken('code-from-server');
      expect(accessToken).toEqual('12345');
    });

    test('should reject with the request error', async () => {
      const error = new Error('network error');
      fetch.mockImplementation(() => Promise.reject(error));
      await expect(
        Nylas.exchangeCodeForToken('code-from-server')
      ).rejects.toThrow(error.message);
    });

    test('should reject with the api error', async () => {
      const apiError = {
        message: 'Unable to associate credentials',
        type: 'api_error',
      };
      fetch.mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(apiError)))
      );
      await expect(
        Nylas.exchangeCodeForToken('code-from-server')
      ).rejects.toThrow(apiError.message);
    });

    test('should reject with default error', async () => {
      fetch.mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(null)))
      );
      await expect(
        Nylas.exchangeCodeForToken('code-from-server')
      ).rejects.toThrow('No access token in response');
    });

    describe('when provided an optional callback', () => {
      test('should call it with the returned access_token', done => {
        fetch.mockImplementation(() =>
          Promise.resolve(new Response('{"access_token":"12345"}'))
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
        fetch.mockImplementation(() => Promise.reject(error));
        Nylas.exchangeCodeForToken('code-from-server', returnedError => {
          expect(returnedError).toEqual(error);
          done();
        }).catch(() => {
          // do nothing
        });
      });
    });
  });

  describe('urlForAuthentication', () => {
    beforeEach(() =>
      Nylas.config({
        clientId: 'newId',
        clientSecret: 'newSecret',
      })
    );

    test('should require a redirectURI', () =>
      expect(() => Nylas.urlForAuthentication()).toThrow());

    test('should throw an exception if the client id has not been configured', () => {
      Nylas.clientId = undefined;
      const options = { redirectURI: 'https://localhost/callback' };
      expect(() => Nylas.urlForAuthentication(options)).toThrow();
    });

    test('should not throw an exception if the client secret has not been configured', () => {
      Nylas.clientSecret = undefined;
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

  describe('application', () => {
    const testSecret = 'mySecret';
    beforeEach(() =>
      Nylas.config({
        clientId: 'myId',
        clientSecret: testSecret,
      })
    );

    test('should throw an exception if the client id has not been configured', () => {
      Nylas.clientId = undefined;
      expect(() => Nylas.application()).toThrow();
    });

    test('should throw an exception if the client secret has not been configured', () => {
      Nylas.clientSecret = undefined;
      expect(() => Nylas.application()).toThrow();
    });

    // test('should make a GET request to /a/<clientId> when options are not provided', () => {
    //   const defaultParams = "?offset=0&limit=100"
    //
    //   fetch.Request = jest.fn((url, options) => {
    //     expect(url.toString()).toEqual(`https://api.nylas.com/a/myId${defaultParams}`);
    //     expect(options.headers['authorization']).toEqual(`Basic ${Buffer.from(`${testSecret}:`, 'utf8').toString('base64')}`);
    //     expect(options.method).toEqual('GET');
    //   });
    //   Nylas.application();
    // });

    // test('should make a PUT request to /a/<clientId> when options are provided', () => {
    //   fetch.Request = jest.fn((url, options) => {
    //     expect(url.toString()).toEqual('https://api.nylas.com/a/myId');
    //     expect(options.headers['authorization']).toEqual(`Basic ${Buffer.from(`${testSecret}:`, 'utf8').toString('base64')}`);
    //     expect(options.method).toEqual('PUT');
    //     expect(options.body).toEqual({
    //       application_name: 'newName',
    //       redirect_uris: ['newURIs'],
    //     });
    //   });
    //   Nylas.application({
    //     applicationName: 'newName',
    //     redirectUris: ['newURIs'],
    //   });
    // });
  });
});
