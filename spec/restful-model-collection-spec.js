import Promise from 'bluebird';
import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import RestfulModelCollection from '../src/models/restful-model-collection';
import Thread from '../src/models/thread';

const testUntil = function(fn) {
  let finished = false;
  runs(() => fn(callback => (finished = true)));
  return waitsFor(() => finished);
};

describe('RestfulModelCollection', function() {
  beforeEach(function() {
    Nylas.config({
      appId: '123',
      appSecret: '123',
    });
    this.connection = new NylasConnection('test-access-token');
    this.collection = new RestfulModelCollection(Thread, this.connection);
  });

  describe('constructor', function() {
    it('should require an inbox connection object', () =>
      expect(() => new RestfulModelCollection(Thread)).toThrow());

    it('should require a model class', () =>
      expect(function() {
        return new RestfulModelCollection(null, this.connection);
      }).toThrow());
  });

  describe('forEach', function() {
    beforeEach(function() {
      const threadsResponses = [];
      for (let x = 0; x <= 3; x++) {
        const response = [];
        const count = x < 3 ? 99 : 12;
        for (
          let i = 0, end = count, asc = 0 <= end;
          asc ? i <= end : i >= end;
          asc ? i++ : i--
        ) {
          response.push({
            id: '123',
            account_id: undefined,
            subject: 'A',
          });
        }
        threadsResponses.push(response);
      }

      spyOn(
        this.collection,
        'getModelCollection'
      ).andCallFake((params, offset, limit) =>
        Promise.resolve(threadsResponses[offset / 100])
      );
    });

    it('should fetch models with the given params', function() {
      const params = { from: 'ben@nylas.com' };
      const threads = [
        {
          id: '123',
          account_id: undefined,
          subject: 'A',
        },
      ];
      this.collection.forEach(params, function() {}, function() {});
      expect(this.collection.getModelCollection).toHaveBeenCalledWith(
        params,
        0,
        100
      );
    });

    it('should fetch repeatedly until fewer than requested models are returned', function() {
      const params = { from: 'ben@nylas.com' };
      runs(function() {
        return this.collection.forEach(params, function() {}, function() {});
      });
      waitsFor(function() {
        return this.collection.getModelCollection.callCount === 4;
      });
      runs(function() {
        expect(this.collection.getModelCollection.calls[0].args).toEqual([
          { from: 'ben@nylas.com' },
          0,
          100,
        ]);
        expect(this.collection.getModelCollection.calls[1].args).toEqual([
          { from: 'ben@nylas.com' },
          100,
          100,
        ]);
        expect(this.collection.getModelCollection.calls[2].args).toEqual([
          { from: 'ben@nylas.com' },
          200,
          100,
        ]);
        expect(this.collection.getModelCollection.calls[3].args).toEqual([
          { from: 'ben@nylas.com' },
          300,
          100,
        ]);
      });
    });

    it('should call eachCallback with each model fetched', function() {
      const params = { from: 'ben@nylas.com' };
      let eachCallCount = 0;
      runs(function() {
        return this.collection.forEach(
          params,
          () => (eachCallCount += 1),
          function() {}
        );
      });
      waitsFor(function() {
        return this.collection.getModelCollection.callCount === 4;
      });
      runs(() => expect(eachCallCount).toBe(313));
    });

    it('should call completeCallback when finished', function() {
      const params = { from: 'ben@nylas.com' };
      let doneCallCount = 0;
      runs(function() {
        return this.collection.forEach(
          params,
          function() {},
          () => (doneCallCount += 1)
        );
      });
      waitsFor(function() {
        return this.collection.getModelCollection.callCount === 4;
      });
      runs(() => expect(doneCallCount).toBe(1));
    });
  });

  describe('count', function() {
    it('should make a request with the provided params and view=count', function() {
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve({}));
      this.collection.count({ from: 'ben@nylas.com' });
      expect(this.connection.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/threads',
        qs: { view: 'count', from: 'ben@nylas.com' },
      });
    });

    describe('when the request is successful', function() {
      beforeEach(function() {
        spyOn(this.connection, 'request').andCallFake(() =>
          Promise.resolve({ count: 1023 })
        );
      });

      it('should resolve with the count', function() {
        testUntil(done => {
          return this.collection
            .count({ from: 'ben@nylas.com' })
            .then(function(count) {
              expect(count).toBe(1023);
              done();
            });
        });
      });

      it('should call the optional callback with the count', function() {
        testUntil(done => {
          return this.collection.count({ from: 'ben@nylas.com' }, function(
            callbackError,
            count
          ) {
            expect(count).toBe(1023);
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

      it('should reject with any error', function() {
        testUntil(done => {
          return this.collection
            .count({ from: 'ben@nylas.com' })
            .catch(rejectError => {
              expect(rejectError).toBe(this.error);
              done();
            });
        });
      });

      it('should call the optional callback with any error', function() {
        testUntil(done => {
          return this.collection.count(
            { from: 'ben@nylas.com' },
            (callbackError, count) => {
              expect(callbackError).toBe(this.error);
              done();
            }
          );
        });
      });
    });
  });

  describe('first', function() {
    describe('when the request is successful', function() {
      beforeEach(function() {
        this.item = { id: '123' };
        this.items = [this.item];
        spyOn(this.collection, 'getModelCollection').andCallFake(() => {
          return Promise.resolve(this.items);
        });
      });

      it('should fetch one item with the provided params', function() {
        this.collection.first({ from: 'ben@nylas.com' });
        expect(this.collection.getModelCollection).toHaveBeenCalledWith(
          { from: 'ben@nylas.com' },
          0,
          1
        );
      });

      it('should resolve with the first item', function() {
        testUntil(done => {
          return this.collection.first({ from: 'ben@nylas.com' }).then(item => {
            expect(item).toBe(this.item);
            done();
          });
        });
      });

      it('should call the optional callback with the first item', function() {
        testUntil(done => {
          return this.collection.first(
            { from: 'ben@nylas.com' },
            (err, item) => {
              expect(item).toBe(this.item);
              done();
            }
          );
        });
      });

      it('should not throw an exception when no items are returned', function() {
        this.items = [];
        testUntil(done => {
          return this.collection.first({ from: 'ben@nylas.com' }).then(item => {
            expect(item).toBe(undefined);
            done();
          });
        });
      });
    });

    describe('when the request fails', function() {
      beforeEach(function() {
        this.error = new Error('Network error');
        spyOn(this.collection, 'getModelCollection').andCallFake(() => {
          return Promise.reject(this.error);
        });
      });

      it('should reject with any underlying error', function() {
        testUntil(done => {
          return this.collection.first({ from: 'ben@nylas.com' }).catch(err => {
            expect(err).toBe(this.error);
            done();
          });
        });
      });

      it('should call the optional callback with the underlying error', function() {
        testUntil(done => {
          return this.collection.first(
            { from: 'ben@nylas.com' },
            (err, item) => {
              expect(err).toBe(this.error);
              done();
            }
          );
        });
      });
    });
  });

  describe('list', () =>
    it('should call range() with an inifite range', function() {
      spyOn(this.collection, 'range');

      const params = { from: 'ben@nylas.com' };
      const callback = function() {};
      this.collection.list(params, callback);
      expect(this.collection.range).toHaveBeenCalledWith(
        params,
        0,
        Infinity,
        callback
      );
    }));

  describe('find', function() {
    it('should reject with an error if an id is not provided', function() {
      testUntil(done => {
        return this.collection.find().catch(done);
      });
    });

    it('should make an API request for the individual model', function() {
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve({}));
      testUntil(done => {
        this.collection.find('123');
        expect(this.connection.request).toHaveBeenCalledWith({
          method: 'GET',
          path: '/threads/123',
          qs: {},
        });
        done();
      });
    });

    it('should pass any additional params to the request', function() {
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve({}));
      testUntil(done => {
        this.collection.find('123', null, { param: 1 });
        expect(this.connection.request).toHaveBeenCalledWith({
          method: 'GET',
          path: '/threads/123',
          qs: { param: 1 },
        });
        done();
      });
    });

    describe('when the request succeeds', function() {
      beforeEach(function() {
        this.item = { id: '123' };
        spyOn(this.connection, 'request').andCallFake(() => {
          return Promise.resolve(this.item);
        });
      });

      it('should resolve with the item', function() {
        testUntil(done => {
          return this.collection.find('123').then(item => {
            expect(item instanceof Thread).toBe(true);
            expect(item.id).toBe('123');
            done();
          });
        });
      });

      it('should call the optional callback with the first item', function() {
        testUntil(done => {
          return this.collection.find('123', (err, item) => {
            expect(item instanceof Thread).toBe(true);
            expect(item.id).toBe('123');
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

      it('should reject with any underlying error', function() {
        testUntil(done => {
          return this.collection.find('123').catch(err => {
            expect(err).toBe(this.error);
            done();
          });
        });
      });

      it('should call the optional callback with the underlying error', function() {
        testUntil(done => {
          return this.collection.find('123', (err, item) => {
            expect(err).toBe(this.error);
            done();
          });
        });
      });
    });
  });

  describe('range', function() {
    beforeEach(function() {
      const threadsResponses = [];
      for (let x = 0; x <= 3; x++) {
        const response = [];
        const count = x < 3 ? 99 : 12;
        for (
          let i = 0, end = count, asc = 0 <= end;
          asc ? i <= end : i >= end;
          asc ? i++ : i--
        ) {
          response.push({
            id: '123',
            account_id: undefined,
            subject: 'A',
          });
        }
        threadsResponses.push(response);
      }

      spyOn(
        this.collection,
        'getModelCollection'
      ).andCallFake((params, offset, limit) =>
        Promise.resolve(threadsResponses[offset / 100])
      );
    });

    it('should fetch once if fewer than one page of models are requested', function() {
      const params = { from: 'ben@nylas.com' };
      const threads = [
        {
          id: '123',
          account_id: undefined,
          subject: 'A',
        },
      ];
      this.collection.range(params, 0, 50);
      expect(this.collection.getModelCollection).toHaveBeenCalledWith(
        params,
        0,
        50
      );
    });

    it('should fetch repeatedly until the requested number of models have been returned', function() {
      const params = { from: 'ben@nylas.com' };
      const threads = [
        {
          id: '123',
          account_id: undefined,
          subject: 'A',
        },
      ];
      runs(function() {
        return this.collection.range(params, 0, 300);
      });
      waitsFor(function() {
        return this.collection.getModelCollection.callCount === 3;
      });
      runs(function() {
        expect(this.collection.getModelCollection.calls[0].args).toEqual([
          { from: 'ben@nylas.com' },
          0,
          100,
        ]);
        expect(this.collection.getModelCollection.calls[1].args).toEqual([
          { from: 'ben@nylas.com' },
          100,
          100,
        ]);
        expect(this.collection.getModelCollection.calls[2].args).toEqual([
          { from: 'ben@nylas.com' },
          200,
          100,
        ]);
      });
    });

    it('should stop fetching if fewer than requested models are returned', function() {
      const params = { from: 'ben@nylas.com' };
      runs(function() {
        return this.collection.range(params, 0, 10000);
      });
      waitsFor(function() {
        return this.collection.getModelCollection.callCount === 4;
      });
      runs(function() {
        expect(this.collection.getModelCollection.calls[0].args).toEqual([
          { from: 'ben@nylas.com' },
          0,
          100,
        ]);
        expect(this.collection.getModelCollection.calls[1].args).toEqual([
          { from: 'ben@nylas.com' },
          100,
          100,
        ]);
        expect(this.collection.getModelCollection.calls[2].args).toEqual([
          { from: 'ben@nylas.com' },
          200,
          100,
        ]);
        expect(this.collection.getModelCollection.calls[3].args).toEqual([
          { from: 'ben@nylas.com' },
          300,
          100,
        ]);
      });
    });

    it('should call the callback with all of the loaded models', function() {
      const params = { from: 'ben@nylas.com' };
      testUntil(done => {
        return this.collection.range(params, 0, 10000, function(err, models) {
          expect(models.length).toBe(313);
          done();
        });
      });
    });

    it('should resolve with the loaded models', function() {
      const params = { from: 'ben@nylas.com' };
      testUntil(done => {
        return this.collection.range(params, 0, 10000).then(function(models) {
          expect(models.length).toBe(313);
          done();
        });
      });
    });
  });

  describe('delete', function() {
    beforeEach(function() {
      return (this.item = new Thread(this.connection, { id: '123' }));
    });

    it('should accept a model object as the first parameter', function() {
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.collection.delete(this.item);
      expect(this.connection.request).toHaveBeenCalledWith({
        method: 'DELETE',
        qs: {},
        path: '/threads/123',
      });
    });

    it('should accept a model id as the first parameter', function() {
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.collection.delete(this.item.id);
      expect(this.connection.request).toHaveBeenCalledWith({
        method: 'DELETE',
        qs: {},
        path: '/threads/123',
      });
    });

    it('should include params in the request if they were passed in', function() {
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.collection.delete(this.item.id, { foo: 'bar' });
      expect(this.connection.request).toHaveBeenCalledWith({
        method: 'DELETE',
        qs: { foo: 'bar' },
        path: '/threads/123',
      });
    });

    describe('when the api request is successful', function() {
      beforeEach(function() {
        spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      });

      it('should resolve', function() {
        testUntil(done => {
          return this.collection.delete(this.item.id).then(() => done());
        });
      });

      it("should call it's callback with no error", function() {
        testUntil(done => {
          return this.collection.delete(this.item.id, err => {
            expect(err).toBe(null);
            done();
          });
        });
      });
    });

    describe('when the api request fails', function() {
      beforeEach(function() {
        this.error = new Error('Network error');
        spyOn(this.connection, 'request').andCallFake(() => {
          return Promise.reject(this.error);
        });
      });

      it('should reject', function() {
        testUntil(done => {
          return this.collection.delete(this.item.id).catch(err => {
            expect(err).toBe(this.error);
            done();
          });
        });
      });

      it("should call it's callback with the error", function() {
        testUntil(done => {
          return this.collection.delete(this.item.id, err => {
            expect(err).toBe(this.error);
            done();
          });
        });
      });
    });
  });

  describe('build', function() {
    it('should return a new instance of the model class', function() {
      expect(this.collection.build() instanceof Thread).toBe(true);
    });

    it('should initialize the new instance with the connection', function() {
      expect(this.collection.build().connection).toBe(this.connection);
    });

    it('should set other attributes provided to the build method', function() {
      expect(this.collection.build({ subject: '123' }).subject).toEqual('123');
    });
  });

  describe('path', () =>
    it("should return the modelClass' collectionName with no prefix", function() {
      expect(this.collection.path()).toEqual('/threads');
    }));
});
