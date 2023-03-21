jest.mock('node-fetch');
import fetch from 'node-fetch';
const { Response } = jest.requireActual('node-fetch');

import NylasConnection from '../src/nylas-connection';
import * as config from '../src/config.ts';
import PACKAGE_JSON from '../package.json';
const SDK_VERSION = PACKAGE_JSON.version;

describe('NylasConnection', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('test-grant-id', {
      clientId: 'foo',
    });
    config.setApiServer('http://nylas.com');
  });

  describe('requestOptions', () => {
    test("should pass view='expanded' when expanded param is provided", () => {
      const options = {
        method: 'GET',
        path: '/threads/123',
        qs: { expanded: true },
      };
      const result = testContext.connection.requestOptions(options);
      const params = result.url.searchParams;
      expect(params.has('expanded')).toEqual(false);
      expect(params.get('view')).toEqual('expanded');
      expect(result.headers['User-Agent']).toEqual(
        `Nylas Node SDK v${SDK_VERSION}`
      );
      expect(result.headers['X-Nylas-Client-Id']).toEqual('foo');
    });
  });
  describe('mismatched api version warnings', () => {
    test('should not warn if Nylas API version matches SDK supported API version', () => {
      const noWarning = testContext.connection.getWarningForVersion(
        '2.0',
        '2.0'
      );
      expect(noWarning).toEqual('');

      const warnSdk = testContext.connection.getWarningForVersion('1.0', '2.0');
      expect(warnSdk).toEqual(
        `WARNING: SDK version may not support your Nylas API version. SDK supports version 1.0 of the API and your application is currently running on version 2.0 of the API. Please update the sdk to ensure it works properly.`
      );

      const warnApi = testContext.connection.getWarningForVersion('2.0', '1.0');
      expect(warnApi).toEqual(
        `WARNING: SDK version may not support your Nylas API version. SDK supports version 2.0 of the API and your application is currently running on version 1.0 of the API. Please update the version of the API that your application is using through the developer dashboard.`
      );
    });
  });
  describe('request', () => {
    describe('error status', () => {
      test('Should fill and return a NylasApiError from a JSON error', done => {
        const errorJson = {
          message: 'Invalid datetime value z for start_time',
          type: 'invalid_request_error',
          missing_fields: ['start_time'],
          server_error: 'This is also a server error',
        };

        fetch.mockReturnValue(
          Promise.resolve(
            new Response(JSON.stringify(errorJson), {
              status: 400,
            })
          )
        );

        return testContext.connection
          .request({
            path: '/test',
            method: 'GET',
          })
          .catch(err => {
            expect(err.message).toEqual(
              'Invalid datetime value z for start_time'
            );
            expect(err.statusCode).toEqual(400);
            expect(err.name).toEqual('Bad Request');
            expect(err.type).toEqual('invalid_request_error');
            expect(err.missingFields).toEqual(['start_time']);
            expect(err.serverError).toEqual('This is also a server error');
            done();
          });
      });

      test('Should return a NylasApiError if error was a non-JSON', done => {
        fetch.mockReturnValue(
          Promise.resolve(
            new Response('This is an error text.', {
              status: 404,
              statusText: 'Not Found',
            })
          )
        );

        return testContext.connection
          .request({
            path: '/test',
            method: 'GET',
          })
          .catch(err => {
            expect(err.message).toEqual('This is an error text.');
            expect(err.statusCode).toEqual(404);
            expect(err.name).toEqual('Not Found');
            expect(err.type).toEqual('Not Found');
            done();
          });
      });

      describe('rate limit errors', () => {
        test('Should fill and return a RateLimitError from a 429 error', done => {
          const errorJson = {
            message: 'Too many requests',
            type: 'invalid_request_error',
          };

          fetch.mockReturnValue(
            Promise.resolve(
              new Response(JSON.stringify(errorJson), {
                status: 429,
                headers: {
                  'X-RateLimit-Limit': '500',
                  'X-RateLimit-Reset': '10',
                },
              })
            )
          );

          return testContext.connection
            .request({
              path: '/test',
              method: 'GET',
            })
            .catch(err => {
              expect(err.message).toEqual('Too many requests');
              expect(err.statusCode).toEqual(429);
              expect(err.name).toEqual('Too Many Requests');
              expect(err.type).toEqual('invalid_request_error');
              expect(err.rateLimit).toEqual(500);
              expect(err.rateLimitReset).toEqual(10);
              done();
            });
        });

        test('Should fill and return a RateLimitError from a 429 error even with invalid/missing headers', done => {
          const errorJson = {
            message: 'Too many requests',
            type: 'invalid_request_error',
          };

          fetch.mockReturnValue(
            Promise.resolve(
              new Response(JSON.stringify(errorJson), {
                status: 429,
                headers: {
                  'X-RateLimit-Limit': 'abcd',
                },
              })
            )
          );

          return testContext.connection
            .request({
              path: '/test',
              method: 'GET',
            })
            .catch(err => {
              expect(err.message).toEqual('Too many requests');
              expect(err.statusCode).toEqual(429);
              expect(err.name).toEqual('Too Many Requests');
              expect(err.type).toEqual('invalid_request_error');
              expect(err.rateLimit).toBeUndefined();
              expect(err.rateLimitReset).toBeUndefined();
              done();
            });
        });
      });
    });
    describe('successful status', () => {
      test('Should return undefined if the content-length header is 0', async () => {
        fetch.mockReturnValue(
          Promise.resolve(
            new Response('This is just text', {
              headers: {
                'content-length': 0,
              },
            })
          )
        );

        const response = await testContext.connection.request({
          path: '/test',
          method: 'GET',
        });
        expect(response).toBeUndefined();
      });

      test('Should return text if the content-type header is "message/rfc822"', async () => {
        fetch.mockReturnValue(
          Promise.resolve(
            new Response('This is just text', {
              headers: {
                'content-length': 17,
                'Content-Type': 'message/rfc822',
              },
            })
          )
        );

        const response = await testContext.connection.request({
          path: '/test',
          method: 'GET',
        });
        expect(response).toEqual('This is just text');
      });

      test('Should deserialize JSON properly', async () => {
        const mockJson = {
          text: 'This is just text',
        };

        fetch.mockReturnValue(
          Promise.resolve(
            new Response(JSON.stringify(mockJson), {
              headers: {
                'content-length': 17,
                'Content-Type': 'application/json',
              },
            })
          )
        );

        const response = await testContext.connection.request({
          path: '/test',
          method: 'GET',
        });
        expect(response).toEqual(mockJson);
      });

      test('Should return text if JSON body parsing fails', async () => {
        fetch.mockReturnValue(
          Promise.resolve(
            new Response('This is just text', {
              headers: {
                'content-length': 17,
                'Content-Type': 'application/json',
              },
            })
          )
        );

        const a = await testContext.connection.request({
          path: '/test',
          method: 'GET',
        });
        expect(a).toEqual('This is just text');
      });
    });
  });
});
