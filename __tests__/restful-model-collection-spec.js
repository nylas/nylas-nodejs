import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import RestfulModelCollection from '../src/models/restful-model-collection';
import Draft from '../src/models/draft';
import Event from '../src/models/event';
import { Folder, Label } from '../src/models/folder';
import Thread from '../src/models/thread';

describe('RestfulModelCollection', () => {
  let testContext;

  beforeEach(() => {
    Nylas.config({
      appId: '123',
      appSecret: '123',
    });
    testContext = {};
    testContext.connection = new NylasConnection('test-access-token', {
      clientId: 'foo',
    });
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

      testContext.collection._getModelCollection = jest.fn(
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
      expect(testContext.collection._getModelCollection).toHaveBeenCalledWith(
        params,
        0,
        100,
        '/threads'
      );
    });

    test('should fetch repeatedly until fewer than requested models are returned', done => {
      const params = { from: 'ben@nylas.com' };
      testContext.collection.forEach(
        params,
        () => {},
        () => {
          expect(
            testContext.collection._getModelCollection.mock.calls[0]
          ).toEqual([{ from: 'ben@nylas.com' }, 0, 100, '/threads']);
          expect(
            testContext.collection._getModelCollection.mock.calls[1]
          ).toEqual([{ from: 'ben@nylas.com' }, 100, 100, '/threads']);
          expect(
            testContext.collection._getModelCollection.mock.calls[2]
          ).toEqual([{ from: 'ben@nylas.com' }, 200, 100, '/threads']);
          expect(
            testContext.collection._getModelCollection.mock.calls[3]
          ).toEqual([{ from: 'ben@nylas.com' }, 300, 100, '/threads']);
          done();
        }
      );
    });

    test('should call eachCallback with each model fetched', done => {
      const params = { from: 'ben@nylas.com' };
      let eachCallCount = 0;
      testContext.collection.forEach(
        params,
        () => (eachCallCount += 1),
        () => {
          expect(eachCallCount).toBe(313);
          done();
        }
      );
    });

    test('should call completeCallback when finished', done => {
      const params = { from: 'ben@nylas.com' };
      let doneCallCount = 0;
      testContext.collection.forEach(
        params,
        () => {},
        () => {
          doneCallCount += 1;
          expect(doneCallCount).toBe(1);
          done();
        }
      );
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
        testContext.item = {
          id: '123',
          headers: {
            'In-Reply-To': null,
            'Message-Id': '<123@mailer.nylas.com>',
            References: [],
          },
        };
        testContext.items = [testContext.item];
        testContext.collection._getModelCollection = jest.fn(() => {
          return Promise.resolve(testContext.items);
        });
      });

      test('should fetch one item with the provided params', done => {
        testContext.collection
          .first({
            from: 'ben@nylas.com',
            view: 'expanded',
          })
          .then(msg => {
            expect(
              testContext.collection._getModelCollection
            ).toHaveBeenCalledWith(
              { from: 'ben@nylas.com', view: 'expanded' },
              0,
              1,
              '/threads'
            );
            expect(msg).toBe(testContext.item);
            done();
          });
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
        testContext.collection._getModelCollection = jest.fn(() => {
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

  describe('list', () => {
    test('should call range() with an infinite range', () => {
      testContext.collection._range = jest.fn();

      const params = { from: 'ben@nylas.com' };
      const callback = () => {};
      testContext.collection.list(params, callback);
      expect(testContext.collection._range).toHaveBeenCalledWith({
        params,
        limit: Infinity,
        callback,
      });
    });
  });

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

  describe('search', () => {
    test('should reject with an error if a query is not provided', () => {
      testContext.collection.search().catch(err => {
        expect(err).toBeInstanceOf(Error);
      });
    });

    test('should reject with an error if called on any model but Message or Thread', () => {
      testContext.collection = new RestfulModelCollection(
        Event,
        testContext.connection
      );
      testContext.collection.search().catch(err => {
        expect(err).toBeInstanceOf(Error);
      });
    });

    test('should make an API request to search with query string', done => {
      testContext.collection.search('blah').catch(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'GET',
          path: '/threads/search',
          qs: { limit: 40, offset: 0, q: 'blah' },
        });
        done();
      });
    });

    test('should pass user-defined limit and offset to the request', done => {
      testContext.collection
        .search('blah', { limit: 1, offset: 1 })
        .catch(() => {
          expect(testContext.connection.request).toHaveBeenCalledWith({
            method: 'GET',
            path: '/threads/search',
            qs: { limit: 1, offset: 1, q: 'blah' },
          });
          done();
        });
    });

    describe('when the request succeeds', () => {
      beforeEach(() => {
        testContext.item = { subject: 'Hey, Jackie!' };
        testContext.connection.request = jest.fn(() => {
          return Promise.resolve([testContext.item]);
        });
      });

      test('should resolve with the item', done => {
        testContext.collection.search('Jackie').then(threads => {
          expect(threads[0] instanceof Thread).toBe(true);
          expect(threads[0].subject).toContain('Jackie');
          done();
        });
      });

      test('should call the optional callback with the first item', done => {
        testContext.collection
          .search('Jackie', {}, (err, threads) => {
            expect(threads[0] instanceof Thread).toBe(true);
            expect(threads[0].subject).toContain('Jackie');
          })
          .then(() => {
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
        testContext.collection.search('Jackie').catch(err => {
          expect(err).toBe(testContext.error);
          done();
        });
      });

      test('should call the optional callback with the underlying error', done => {
        testContext.collection
          .search('Jackie', {}, (err, item) => {
            expect(err).toBe(testContext.error);
          })
          .catch(() => {
            done();
          });
      });
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      testContext.collection = new RestfulModelCollection(
        Event,
        testContext.connection
      );
      testContext.item = new Event(testContext.connection, {
        id: '123',
      });
    });

    test('should populate qs if params passed in', done => {
      testContext.collection.delete(testContext.item, { notify_participants: false });
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'DELETE',
        qs: { notify_participants: false },
        body: {},
        path: '/events/123',
      });
      done();
    });

    test('should accept an object id as the first parameter', done => {
      testContext.collection.delete(testContext.item.id, { notify_participants: true });
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'DELETE',
        qs: { notify_participants: true },
        body: {},
        path: '/events/123',
      });
      done();
    });

    test('should work without query params', done => {
      testContext.collection.delete(testContext.item);
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'DELETE',
        qs: {},
        body: {},
        path: '/events/123',
      });
      done();
    });

    test('should work with extraneous params', done => {
      testContext.collection.delete(testContext.item, {'foo': 'bar'});
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'DELETE',
        qs: {},
        body: {},
        path: '/events/123',
      });
      done();
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

    describe('test folder and label deletion', () => {
      test('folder should not have a delete request body', done => {
        testContext.collection = new RestfulModelCollection(
          Folder,
          testContext.connection
        );
        testContext.item = new Folder(testContext.connection, {
          id: '123',
          displayName: 'foo'
        });
        testContext.collection.delete(testContext.item, {'display_name': 'not required'});
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'DELETE',
          qs: {},
          body: {},
          path: '/folders/123',
        });
        done();
      });

      test('label should have a delete request body', done => {
        testContext.collection = new RestfulModelCollection(
          Label,
          testContext.connection
        );
        testContext.item = new Label(testContext.connection, {
          id: '123',
          displayName: 'foo'
        });
        testContext.collection.delete(testContext.item, {'display_name': 'required'});
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'DELETE',
          qs: {},
          body: {'display_name': 'required'},
          path: '/labels/123',
        });
        done();
      });

      test('delete should read displayName from label object if display_name not provided', done => {
        testContext.collection = new RestfulModelCollection(
          Label,
          testContext.connection
        );
        testContext.item = new Label(testContext.connection, {
          id: '123',
        });
        testContext.item.displayName = 'foo';
        testContext.collection.delete(testContext.item);
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'DELETE',
          qs: {},
          body: {'display_name': 'foo'},
          path: '/labels/123',
        });
        done();
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

  describe('deleteItem', () => {
    beforeEach(() => {
      testContext.collection = new RestfulModelCollection(
        Draft,
        testContext.connection
      );
      testContext.item = new Draft(testContext.connection, {
        id: '123', version: 0,
      });
    });

    test('should populate body with draft object\'s version if version param not provided', () => {
      testContext.collection.deleteItem({item: testContext.item});
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'DELETE',
        qs: {},
        body: { version: 0 },
        path: '/drafts/123',
      });
    });

    test('should override draft version if it was passed in', () => {
      testContext.collection.deleteItem({item: testContext.item, body: { version: 2 }});
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'DELETE',
        qs: {},
        body: { version: 2 },
        path: '/drafts/123',
      });
    });

    describe('when the api request is successful', () => {
      test('should resolve', done => {
        testContext.collection.deleteItem({item: testContext.item}).then(() => done());
      });

      test('should call its callback with no error', done => {
        function callback(err) {
          expect(err).toBe(null);
          done();
        }
        testContext.collection.deleteItem({item: testContext.item, callback: callback});
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
        testContext.collection.deleteItem({item: testContext.item}).catch(err => {
          expect(err).toBe(testContext.error);
          done();
        });
      });

      test('should call its callback with the error', done => {
        function callback(err) {
          expect(err).toBe(testContext.error);
          done();
        }
        testContext.collection
          .deleteItem({item: testContext.item, callback: callback})
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

  describe('path', () => {
    test("should return the modelClass' collectionName with no prefix", () => {
      expect(testContext.collection.path()).toEqual('/threads');
    });
  });

  describe('_range', () => {
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

      testContext.collection._getModelCollection = jest.fn(
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
      testContext.collection._range({ params, offset: 0, limit: 50 });
      expect(testContext.collection._getModelCollection).toHaveBeenCalledWith(
        params,
        0,
        50,
        '/threads'
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
      const callback = () => {
        expect(
          testContext.collection._getModelCollection.mock.calls[0]
        ).toEqual([{ from: 'ben@nylas.com' }, 0, 100, '/threads']);
        expect(
          testContext.collection._getModelCollection.mock.calls[1]
        ).toEqual([{ from: 'ben@nylas.com' }, 100, 100, '/threads']);
        expect(
          testContext.collection._getModelCollection.mock.calls[2]
        ).toEqual([{ from: 'ben@nylas.com' }, 200, 100, '/threads']);
      };
      testContext.collection._range({
        params,
        callback,
        offset: 0,
        limit: 300,
      });
    });

    test('should stop fetching if fewer than requested models are returned', () => {
      const params = { from: 'ben@nylas.com' };
      const callback = () => {
        expect(
          testContext.collection._getModelCollection.mock.calls[0]
        ).toEqual([{ from: 'ben@nylas.com' }, 0, 100, '/threads']);
        expect(
          testContext.collection._getModelCollection.mock.calls[1]
        ).toEqual([{ from: 'ben@nylas.com' }, 100, 100, '/threads']);
        expect(
          testContext.collection._getModelCollection.mock.calls[2]
        ).toEqual([{ from: 'ben@nylas.com' }, 200, 100, '/threads']);
        expect(
          testContext.collection._getModelCollection.mock.calls[3]
        ).toEqual([{ from: 'ben@nylas.com' }, 300, 100, '/threads']);
      };
      testContext.collection._range({
        params,
        callback,
        offset: 0,
        limit: 10000,
      });
    });

    test('should call the callback with all of the loaded models', done => {
      const params = { from: 'ben@nylas.com' };
      testContext.collection._range({
        params,
        offset: 0,
        limit: 10000,
        callback: (err, models) => {
          expect(models.length).toBe(313);
          done();
        },
      });
    });

    test('should resolve with the loaded models', done => {
      const params = { from: 'ben@nylas.com' };
      testContext.collection
        ._range({ params, offset: 0, limit: 10000 })
        .then(function(models) {
          expect(models.length).toBe(313);
          done();
        });
    });
  });
});
