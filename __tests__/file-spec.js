import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import File from '../src/models/file';

describe('File', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
    testContext.connection.request = jest.fn(() => Promise.resolve());
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
      testContext.file.upload().catch(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          json: false,
          path: '/files',
          formData: {
            file: {
              value: 'Sample data',
              options: {
                filename: 'sample.txt',
                contentType: 'text/plain',
              },
            },
          },
        });
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
              size: 123
            },
          ];
          return Promise.resolve(fileJSON);
        });
      });

      test('should resolve with the file object', done => {
        testContext.file.upload().then(file => {
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
        testContext.file.upload((err, file) => {
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
        testContext.file.upload().catch(err => {
          expect(err).toBe(testContext.error);
          done();
        });
      });

      test('should call the callback with the error', done => {
        testContext.file
          .upload((err, file) => {
            expect(err).toBe(testContext.error);
            expect(file).toBe(undefined);
            done();
          })
          .catch(() => {});
      });
    });
  });

  describe('download', () => {
    test('should do a GET request', done => {
      testContext.file.download().catch(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          path: '/files/fileId/download',
          encoding: null,
          downloadRequest: true,
        });
        done();
      });
    });

    describe('when the request succeeds', () => {
      beforeEach(() => {
        testContext.connection.request = jest.fn(() => {
          const response = {
            headers: {
              header1: '1',
              header2: '2',
            },
            body: 'body',
            otherField: 'other',
          };
          return Promise.resolve(response);
        });
      });

      test('should resolve with the file information', done => {
        testContext.file.download().then(file => {
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
        testContext.file.download((err, file) => {
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
        testContext.file.download().catch(err => {
          expect(err).toBe(testContext.error);
          done();
        });
      });

      test('should call the callback with the error', done => {
        testContext.file
          .download((err, file) => {
            expect(err).toBe(testContext.error);
            expect(file).toBe(undefined);
            done();
          })
          .catch(() => {});
      });
    });
  });

  describe('metadata', () => {
    test('should do a GET request', () => {
      testContext.file.metadata();
      expect(testContext.connection.request).toHaveBeenCalledWith({
        path: '/files/fileId',
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
        testContext.file.metadata().then(response => {
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
        testContext.file.metadata((err, response) => {
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
        testContext.file.metadata().catch(err => {
          expect(err).toBe(testContext.error);
          done();
        });
      });

      test('should call the callback with the error', done => {
        testContext.file
          .metadata((err, file) => {
            expect(err).toBe(testContext.error);
            expect(file).toBe(undefined);
            done();
          })
          .catch(() => {});
      });
    });
  });
});
