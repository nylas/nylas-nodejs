import NylasConnection from '../src/nylas-connection';
import File from '../src/models/file';
import fetch from 'node-fetch';
import Nylas from '../src/nylas';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('File', () => {
  let testContext;

  beforeEach(() => {
    Nylas.config({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
      apiServer: 'https://api.nylas.com',
    });
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
    jest.spyOn(testContext.connection, 'request');

    const headers = new Map();
    headers.set('header1', '1');
    headers.set('header2', '2');
    const response = receivedBody => {
      return {
        status: 200,
        buffer: () => {
          return Promise.resolve('body');
        },
        json: () => {
          // Just a placeholder so that we can mimic returning data after uploading
          // This data is not used
          if (
            receivedBody === null ||
            receivedBody.constructor.name === 'FormData'
          ) {
            return Promise.resolve([JSON.stringify(testContext.file.toJSON())]);
          }
          return Promise.resolve(receivedBody);
        },
        headers: headers,
      };
    };

    fetch.mockImplementation(req => Promise.resolve(response(req.body)));

    testContext.file = new File(testContext.connection);
    testContext.file.data = 'Sample data';
    testContext.file.contentType = 'text/plain';
    testContext.file.filename = 'sample.txt';
    testContext.file.id = 'fileId';
  });

  describe('upload', () => {
    test('should raise error if missing filename', done => {
      testContext.file.filename = undefined;
      expect(() => {
        testContext.file.upload();
      }).toThrow();
      done();
    });

    test('should raise error if missing data', done => {
      testContext.file.data = undefined;
      expect(() => {
        testContext.file.upload();
      }).toThrow();
      done();
    });

    test('should raise error if missing contentType', done => {
      testContext.file.contentType = undefined;
      expect(() => {
        testContext.file.upload();
      }).toThrow();
      done();
    });

    test('should do a POST request', done => {
      return testContext.file.upload().then(() => {
        const callParams = testContext.connection.request.mock.calls[0][0];
        const expectedFormData = {
          file: {
            value: 'Sample data',
            options: {
              filename: 'sample.txt',
              contentType: 'text/plain',
            },
          },
        };

        expect(callParams['method']).toEqual('POST');
        expect(callParams['json']).toBe(true);
        expect(callParams['path']).toEqual('/files');
        expect(callParams['formData']).toEqual(expectedFormData);
        expect(typeof callParams['body']).toBe('object');
        done();
      });
    });

    test('should add knownLength to the request formData', done => {
      testContext.file.size = 12345;
      return testContext.file.upload().then(() => {
        const callParams = testContext.connection.request.mock.calls[0][0];
        const expectedFormData = {
          file: {
            value: 'Sample data',
            options: {
              filename: 'sample.txt',
              contentType: 'text/plain',
              knownLength: 12345,
            },
          },
        };

        expect(callParams['method']).toEqual('POST');
        expect(callParams['json']).toBe(true);
        expect(callParams['path']).toEqual('/files');
        expect(callParams['formData']).toEqual(expectedFormData);
        expect(typeof callParams['body']).toBe('object');
        done();
      });
    });

    describe('when the request succeeds', () => {
      beforeEach(() => {
        testContext.connection.request = jest.fn(() => {
          const fileJSON = [
            {
              account_id: 'aid-5678',
              content_type: 'text/plain',
              filename: 'sample.txt',
              id: 'id-1234',
              object: 'file',
              size: 123,
            },
          ];
          return Promise.resolve(fileJSON);
        });
      });

      test('should resolve with the file object', done => {
        return testContext.file.upload().then(file => {
          expect(file.accountId).toBe('aid-5678');
          expect(file.contentType).toBe('text/plain');
          expect(file.filename).toBe('sample.txt');
          expect(file.id).toBe('id-1234');
          expect(file.object).toBe('file');
          expect(file.size).toBe(123);
          done();
        });
      });

      test('should call the callback with the file object', done => {
        return testContext.file.upload((err, file) => {
          expect(err).toBe(null);
          expect(file.accountId).toBe('aid-5678');
          expect(file.contentType).toBe('text/plain');
          expect(file.filename).toBe('sample.txt');
          expect(file.id).toBe('id-1234');
          expect(file.object).toBe('file');
          expect(file.size).toBe(123);
          done();
        });
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        testContext.error = new Error('Network error');
        testContext.connection.request = jest.fn(() => {
          return Promise.reject(testContext.error);
        });
      });

      test('should reject with the error', done => {
        return testContext.file
          .upload()
          .catch(err => {
            expect(err).toBe(testContext.error);
            done();
          })
          .catch(() => {
            // do nothing
          });
      });

      test('should call the callback with the error', done => {
        return testContext.file
          .upload((err, file) => {
            expect(err).toBe(testContext.error);
            expect(file).toBe(undefined);
            done();
          })
          .catch(() => {
            // do nothing
          });
      });
    });
  });

  describe('download', () => {
    test('should do a GET request', done => {
      return testContext.file.download().then(() => {
        const callParams = testContext.connection.request.mock.calls[0][0];

        expect(callParams['downloadRequest']).toBe(true);
        expect(callParams['path']).toBe('/files/fileId/download');
        done();
      });
    });

    describe('when the request succeeds', () => {
      test('should resolve with the file information', done => {
        return testContext.file.download().then(file => {
          const fileInfo = {
            body: 'body',
            header1: '1',
            header2: '2',
          };
          expect(file).toEqual(fileInfo);
          done();
        });
      });

      test('should call the callback with the file object', done => {
        return testContext.file.download((err, file) => {
          const fileInfo = {
            body: 'body',
            header1: '1',
            header2: '2',
          };
          expect(err).toBe(null);
          expect(file).toEqual(fileInfo);
          done();
        });
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        testContext.error = new Error('Network error');
        testContext.connection.request = jest.fn(() => {
          return Promise.reject(testContext.error);
        });
      });

      test('should reject with the error', done => {
        return testContext.file
          .download()
          .catch(err => {
            expect(err).toBe(testContext.error);
            done();
          })
          .catch(() => {
            // do nothing
          });
      });

      test('should call the callback with the error', done => {
        return testContext.file
          .download((err, file) => {
            expect(err).toBe(testContext.error);
            expect(file).toBe(undefined);
            done();
          })
          .catch(() => {
            // do nothing
          });
      });
    });
  });

  describe('metadata', () => {
    test('should do a GET request', done => {
      return testContext.file.metadata().then(() => {
        const callParams = testContext.connection.request.mock.calls[0][0];
        expect(callParams['path']).toEqual('/files/fileId');
        done();
      });
    });

    describe('when the request succeeds', () => {
      beforeEach(() => {
        testContext.connection.request = jest.fn(() => {
          const response = {
            content_type: 'image/jpeg',
            filename: 'sailing_photo.jpg',
            id: 'dyla86usnzouam5wt7wt2bsvu',
            message_ids: ['cud32592sewzy834bzhsbu0kt'],
            account_id: '6aakaxzi4j5gn6f7kbb9e0fxs',
            object: 'file',
            size: 8380,
          };
          return Promise.resolve(response);
        });
      });

      test('should resolve with the file information', done => {
        return testContext.file.metadata().then(response => {
          const fileInfo = {
            content_type: 'image/jpeg',
            filename: 'sailing_photo.jpg',
            id: 'dyla86usnzouam5wt7wt2bsvu',
            message_ids: ['cud32592sewzy834bzhsbu0kt'],
            account_id: '6aakaxzi4j5gn6f7kbb9e0fxs',
            object: 'file',
            size: 8380,
          };
          expect(response).toEqual(fileInfo);
          done();
        });
      });

      test('should call the callback with the file object', done => {
        return testContext.file.metadata((err, response) => {
          const fileInfo = {
            content_type: 'image/jpeg',
            filename: 'sailing_photo.jpg',
            id: 'dyla86usnzouam5wt7wt2bsvu',
            message_ids: ['cud32592sewzy834bzhsbu0kt'],
            account_id: '6aakaxzi4j5gn6f7kbb9e0fxs',
            object: 'file',
            size: 8380,
          };
          expect(err).toBe(null);
          expect(response).toEqual(fileInfo);
          done();
        });
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        testContext.error = new Error('Network error');
        testContext.connection.request = jest.fn(() => {
          return Promise.reject(testContext.error);
        });
      });

      test('should reject with the error', done => {
        return testContext.file
          .metadata()
          .catch(err => {
            expect(err).toBe(testContext.error);
            done();
          })
          .catch(() => {
            // do nothing
          });
      });

      test('should call the callback with the error', done => {
        return testContext.file
          .metadata((err, file) => {
            expect(err).toBe(testContext.error);
            expect(file).toBe(undefined);
            done();
          })
          .catch(() => {
            // do nothing
          });
      });
    });
  });
});
