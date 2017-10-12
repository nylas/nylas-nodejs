import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import File from '../src/models/file';
import Promise from 'bluebird';
import request from 'request';
import _ from 'underscore';

const testUntil = function(fn) {
  let finished = false;
  runs(() => fn(callback => (finished = true)));
  waitsFor(() => finished);
};

describe('File', function() {
  beforeEach(function() {
    this.connection = new NylasConnection('123');
    this.file = new File(this.connection);
    this.file.data = 'Sample data';
    this.file.contentType = 'text/plain';
    this.file.filename = 'sample.txt';
    this.file.id = 'fileId';
    return Promise.onPossiblyUnhandledRejection(function(e, promise) {});
  });

  describe('upload', function() {
    it('should do a POST request', function() {
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.file.upload();
      expect(this.connection.request).toHaveBeenCalledWith({
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
    });

    describe('when the request succeeds', function() {
      beforeEach(function() {
        spyOn(this.connection, 'request').andCallFake(function() {
          const fileJSON = [
            {
              id: 'id-1234',
              filename: 'sample.txt',
            },
          ];
          return Promise.resolve(fileJSON);
        });
      });

      it('should resolve with the file object', function() {
        testUntil(done => {
          this.file.upload().then(function(file) {
            expect(file.id).toBe('id-1234');
            expect(file.filename).toBe('sample.txt');
            done();
          });
        });
      });

      it('should call the callback with the file object', function() {
        testUntil(done => {
          this.file.upload(function(err, file) {
            expect(err).toBe(null);
            expect(file.id).toBe('id-1234');
            expect(file.filename).toBe('sample.txt');
            done();
          });
        });
      });
    });

    describe('when the request fails', function() {
      beforeEach(function() {
        this.error = new Error('Network error');
        spyOn(this.connection, 'request').andCallFake(() => {
          return Promise.reject(this.error);
        });
      });

      it('should reject with the error', function() {
        testUntil(done => {
          this.file.upload().catch(err => {
            expect(err).toBe(this.error);
            done();
          });
        });
      });

      it('should call the callback with the error', function() {
        testUntil(done => {
          this.file.upload((err, file) => {
            expect(err).toBe(this.error);
            expect(file).toBe(undefined);
            done();
          });
        });
      });
    });
  });

  describe('download', function() {
    it('should do a GET request', function() {
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.file.download();
      expect(this.connection.request).toHaveBeenCalledWith({
        path: '/files/fileId/download',
        encoding: null,
        downloadRequest: true,
      });
    });

    describe('when the request succeeds', function() {
      beforeEach(function() {
        spyOn(this.connection, 'request').andCallFake(function() {
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

      it('should resolve with the file information', function() {
        testUntil(done => {
          this.file.download().then(function(file) {
            const fileInfo = {
              body: 'body',
              header1: '1',
              header2: '2',
            };
            expect(file).toEqual(fileInfo);
            done();
          });
        });
      });

      it('should call the callback with the file object', function() {
        testUntil(done => {
          this.file.download(function(err, file) {
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
    });

    describe('when the request fails', function() {
      beforeEach(function() {
        this.error = new Error('Network error');
        spyOn(this.connection, 'request').andCallFake(() => {
          return Promise.reject(this.error);
        });
      });

      it('should reject with the error', function() {
        testUntil(done => {
          this.file.download().catch(err => {
            expect(err).toBe(this.error);
            done();
          });
        });
      });

      it('should call the callback with the error', function() {
        testUntil(done => {
          this.file.download((err, file) => {
            expect(err).toBe(this.error);
            expect(file).toBe(undefined);
            done();
          });
        });
      });
    });
  });

  describe('metadata', function() {
    it('should do a GET request', function() {
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.file.metadata();
      expect(this.connection.request).toHaveBeenCalledWith({
        path: '/files/fileId',
      });
    });

    describe('when the request succeeds', function() {
      beforeEach(function() {
        spyOn(this.connection, 'request').andCallFake(function() {
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

      it('should resolve with the file information', function() {
        testUntil(done => {
          this.file.metadata().then(function(response) {
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
      });

      it('should call the callback with the file object', function() {
        testUntil(done => {
          this.file.metadata(function(err, response) {
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
    });

    describe('when the request fails', function() {
      beforeEach(function() {
        this.error = new Error('Network error');
        spyOn(this.connection, 'request').andCallFake(() => {
          return Promise.reject(this.error);
        });
      });

      it('should reject with the error', function() {
        testUntil(done => {
          this.file.metadata().catch(err => {
            expect(err).toBe(this.error);
            done();
          });
        });
      });

      it('should call the callback with the error', function() {
        testUntil(done => {
          this.file.metadata((err, file) => {
            expect(err).toBe(this.error);
            expect(file).toBe(undefined);
            done();
          });
        });
      });
    });
  });
});
