import Promise from 'bluebird';
import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import RestfulModelCollection from '../src/models/restful-model-collection';
import Thread from '../src/models/thread';

describe('RestfulModelCollection', () => {
  let testContext;

  beforeEach(() => {
    Nylas.config({
      appId: '123',
      appSecret: '123',
    });
    testContext = {};
    testContext.connection = new NylasConnection('test-access-token');
    testContext.connection.request = jest.fn(() => Promise.resolve());
    testContext.collection = new RestfulModelCollection(
      Thread,
      testContext.connection
    );
  });

  describe('constructor', () => {
    test('should require an inbox connection object', () =>
      expect(() => new RestfulModelCollection(Thread)).toThrow());

    test('should require a model class', () =>
      expect(() => {
        return new RestfulModelCollection(null, this.connection);
      }).toThrow());
  });

  describe('forEach', () => {
    beforeEach(() => {
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

      testContext.collection.getModelCollection = jest.fn(
        (params, offset, limit) =>
          Promise.resolve(threadsResponses[offset / 100])
      );
    });

    test('should fetch models with the given params', () => {
      const params = { from: 'ben@nylas.com' };
      const threads = [
        {
          id: '123',
          account_id: undefined,
          subject: 'A',
        },
      ];
      testContext.collection.forEach(params, () => {}, () => {});
      expect(testContext.collection.getModelCollection).toHaveBeenCalledWith(
        params,
        0,
        100
      );
    });

    test('should fetch repeatedly until fewer than requested models are returned', done => {
      const params = { from: 'ben@nylas.com' };
      testContext.collection.forEach(params, () => {}, () => {});
      setTimeout(() => {
        expect(
          testContext.collection.getModelCollection.mock.calls[0]
        ).toEqual([{ from: 'ben@nylas.com' }, 0, 100]);
        expect(
          testContext.collection.getModelCollection.mock.calls[1]
        ).toEqual([{ from: 'ben@nylas.com' }, 100, 100]);
        expect(
          testContext.collection.getModelCollection.mock.calls[2]
        ).toEqual([{ from: 'ben@nylas.com' }, 200, 100]);
        expect(
          testContext.collection.getModelCollection.mock.calls[3]
        ).toEqual([{ from: 'ben@nylas.com' }, 300, 100]);
        done();
      }, 5);
    });

    test('should call eachCallback with each model fetched', done => {
      const params = { from: 'ben@nylas.com' };
      let eachCallCount = 0;
      testContext.collection.forEach(
        params,
        () => (eachCallCount += 1),
        () => {}
      );
      setTimeout(() => {
        expect(eachCallCount).toBe(313);
        done();
      }, 5);
    });

    test('should call completeCallback when finished', done => {
      const params = { from: 'ben@nylas.com' };
      let doneCallCount = 0;
      testContext.collection.forEach(
        params,
        () => {},
        () => (doneCallCount += 1)
      );
      setTimeout(() => {
        expect(doneCallCount).toBe(1);
        done();
      }, 5);
    });
  });

  describe('count', () => {
    test('should make a request with the provided params and view=count', done => {
      testContext.collection.count({ from: 'ben@nylas.com' }).catch(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'GET',
          path: '/threads',
          qs: { view: 'count', from: 'ben@nylas.com' },
        });
        done();
      });
    });

    describe('when the request is successful', () => {
      beforeEach(() => {
        testContext.connection.request = jest.fn(() =>
          Promise.resolve({ count: 1023 })
        );
      });

      test('should resolve with the count', done => {
        testContext.collection.count({ from: 'ben@nylas.com' }).then(count => {
          expect(count).toBe(1023);
          done();
        });
      });

      test('should call the optional callback with the count', done => {
        testContext.collection.count(
          { from: 'ben@nylas.com' },
          (callbackError, count) => {
            expect(count).toBe(1023);
            done();
          }
        );
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        testContext.error = new Error('Network error');
        testContext.connection.request = jest.fn(() => {
          return Promise.reject(testContext.error);
        });
      });

      test('should reject with any error', done => {
        testContext.collection
          .count({ from: 'ben@nylas.com' })
          .catch(rejectError => {
            expect(rejectError).toBe(testContext.error);
            done();
          });
      });

      test('should call the optional callback with any error', done => {
        testContext.collection
          .count({ from: 'ben@nylas.com' }, (callbackError, count) => {
            expect(callbackError).toBe(testContext.error);
            done();
          })
          .catch(() => {});
      });
    });
  });

  describe('first', () => {
    describe('when the request is successful', () => {
      beforeEach(() => {
        testContext.item = { id: '123' };
        testContext.items = [testContext.item];
        testContext.collection.getModelCollection = jest.fn(() => {
          return Promise.resolve(testContext.items);
        });
      });

      test('should fetch one item with the provided params', () => {
        testContext.collection.first({ from: 'ben@nylas.com' });
        expect(testContext.collection.getModelCollection).toHaveBeenCalledWith(
          { from: 'ben@nylas.com' },
          0,
          1
        );
      });

      test('should resolve with the first item', done => {
        testContext.collection.first({ from: 'ben@nylas.com' }).then(item => {
          expect(item).toBe(testContext.item);
          done();
        });
      });

      test('should call the optional callback with the first item', done => {
        testContext.collection.first({ from: 'ben@nylas.com' }, (err, item) => {
          expect(item).toBe(testContext.item);
          done();
        });
      });

      test('should not throw an exception when no items are returned', done => {
        testContext.items = [];
        testContext.collection.first({ from: 'ben@nylas.com' }).then(item => {
          expect(item).toBe(undefined);
          done();
        });
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        testContext.error = new Error('Network error');
        testContext.collection.getModelCollection = jest.fn(() => {
          return Promise.reject(testContext.error);
        });
      });

      test('should reject with any underlying error', done => {
        testContext.collection.first({ from: 'ben@nylas.com' }).catch(err => {
          expect(err).toBe(testContext.error);
          done();
        });
      });

      test('should call the optional callback with the underlying error', done => {
        testContext.collection
          .first({ from: 'ben@nylas.com' }, (err, item) => {
            expect(err).toBe(testContext.error);
            done();
          })
          .catch(() => {});
      });
    });
  });

  describe('list', () =>
    test('should call range() with an inifite range', () => {
      testContext.collection.range = jest.fn();

      const params = { from: 'ben@nylas.com' };
      const callback = () => {};
      testContext.collection.list(params, callback);
      expect(testContext.collection.range).toHaveBeenCalledWith(
        params,
        0,
        Infinity,
        callback
      );
    }));

  describe('find', () => {
    test('should reject with an error if an id is not provided', () => {
      testContext.collection.find().catch(() => {});
    });

    test('should make an API request for the individual model', done => {
      testContext.collection.find('123');
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/threads/123',
        qs: {},
      });
      done();
    });

    test('should pass any additional params to the request', done => {
      testContext.collection.find('123', null, { param: 1 });
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/threads/123',
        qs: { param: 1 },
      });
      done();
    });

    describe('when the request succeeds', () => {
      beforeEach(() => {
        testContext.item = { id: '123' };
        testContext.connection.request = jest.fn(() => {
          return Promise.resolve(testContext.item);
        });
      });

      test('should resolve with the item', done => {
        testContext.collection.find('123').then(item => {
          expect(item instanceof Thread).toBe(true);
          expect(item.id).toBe('123');
          done();
        });
      });

      test('should call the optional callback with the first item', done => {
        testContext.collection.find('123', (err, item) => {
          expect(item instanceof Thread).toBe(true);
          expect(item.id).toBe('123');
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

      test('should reject with any underlying error', done => {
        testContext.collection.find('123').catch(err => {
          expect(err).toBe(testContext.error);
          done();
        });
      });

      test('should call the optional callback with the underlying error', done => {
        testContext.collection
          .find('123', (err, item) => {
            expect(err).toBe(testContext.error);
            done();
          })
          .catch(() => {});
      });
    });
  });

  describe('range', () => {
    beforeEach(() => {
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

      testContext.collection.getModelCollection = jest.fn(
        (params, offset, limit) =>
          Promise.resolve(threadsResponses[offset / 100])
      );
    });

    test('should fetch once if fewer than one page of models are requested', () => {
      const params = { from: 'ben@nylas.com' };
      const threads = [
        {
          id: '123',
          account_id: undefined,
          subject: 'A',
        },
      ];
      testContext.collection.range(params, 0, 50);
      expect(testContext.collection.getModelCollection).toHaveBeenCalledWith(
        params,
        0,
        50
      );
    });

    test('should fetch repeatedly until the requested number of models have been returned', () => {
      const params = { from: 'ben@nylas.com' };
      const threads = [
        {
          id: '123',
          account_id: undefined,
          subject: 'A',
        },
      ];
      testContext.collection.range(params, 0, 300);
      setTimeout(() => {
        expect(
          testContext.collection.getModelCollection.calls[0].args
        ).toEqual([{ from: 'ben@nylas.com' }, 0, 100]);
        expect(
          testContext.collection.getModelCollection.calls[1].args
        ).toEqual([{ from: 'ben@nylas.com' }, 100, 100]);
        expect(
          testContext.collection.getModelCollection.calls[2].args
        ).toEqual([{ from: 'ben@nylas.com' }, 200, 100]);
      }, 5);
    });

    test('should stop fetching if fewer than requested models are returned', () => {
      const params = { from: 'ben@nylas.com' };
      testContext.collection.range(params, 0, 10000);
      setTimeout(() => {
        expect(
          testContext.collection.getModelCollection.calls[0].args
        ).toEqual([{ from: 'ben@nylas.com' }, 0, 100]);
        expect(
          testContext.collection.getModelCollection.calls[1].args
        ).toEqual([{ from: 'ben@nylas.com' }, 100, 100]);
        expect(
          testContext.collection.getModelCollection.calls[2].args
        ).toEqual([{ from: 'ben@nylas.com' }, 200, 100]);
        expect(
          testContext.collection.getModelCollection.calls[3].args
        ).toEqual([{ from: 'ben@nylas.com' }, 300, 100]);
      }, 5);
    });

    test('should call the callback with all of the loaded models', done => {
      const params = { from: 'ben@nylas.com' };
      testContext.collection.range(params, 0, 10000, (err, models) => {
        expect(models.length).toBe(313);
        done();
      });
    });

    test('should resolve with the loaded models', done => {
      const params = { from: 'ben@nylas.com' };
      testContext.collection.range(params, 0, 10000).then(function(models) {
        expect(models.length).toBe(313);
        done();
      });
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      testContext.item = new Thread(testContext.connection, {
        id: '123',
      });
    });

    test('should accept a model object as the first parameter', () => {
      testContext.collection.delete(testContext.item);
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'DELETE',
        qs: {},
        path: '/threads/123',
      });
    });

    test('should accept a model id as the first parameter', () => {
      testContext.collection.delete(testContext.item.id);
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'DELETE',
        qs: {},
        path: '/threads/123',
      });
    });

    test('should include params in the request if they were passed in', () => {
      testContext.collection.delete(testContext.item.id, { foo: 'bar' });
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'DELETE',
        qs: { foo: 'bar' },
        path: '/threads/123',
      });
    });

    describe('when the api request is successful', () => {
      test('should resolve', done => {
        testContext.collection.delete(testContext.item.id).then(() => done());
      });

      test('should call its callback with no error', done => {
        testContext.collection.delete(testContext.item.id, err => {
          expect(err).toBe(null);
          done();
        });
      });
    });

    describe('when the api request fails', () => {
      beforeEach(() => {
        testContext.error = new Error('Network error');
        testContext.connection.request = jest.fn(() => {
          return Promise.reject(testContext.error);
        });
      });

      test('should reject', done => {
        testContext.collection.delete(testContext.item.id).catch(err => {
          expect(err).toBe(testContext.error);
          done();
        });
      });

      test('should call its callback with the error', done => {
        testContext.collection
          .delete(testContext.item.id, err => {
            expect(err).toBe(testContext.error);
            done();
          })
          .catch(() => {});
      });
    });
  });

  describe('build', () => {
    test('should return a new instance of the model class', () => {
      expect(testContext.collection.build() instanceof Thread).toBe(true);
    });

    test('should initialize the new instance with the connection', () => {
      expect(testContext.collection.build().connection).toBe(
        testContext.connection
      );
    });

    test('should set other attributes provided to the build method', () => {
      expect(testContext.collection.build({ subject: '123' }).subject).toEqual(
        '123'
      );
    });
  });

  describe('path', () =>
    test("should return the modelClass' collectionName with no prefix", () => {
      expect(testContext.collection.path()).toEqual('/threads');
    }));
});
