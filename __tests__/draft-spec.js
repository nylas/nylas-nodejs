import Promise from 'bluebird';
import request from 'request';
import _ from 'underscore';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Draft from '../src/models/draft';
import Message from '../src/models/message';

describe('Draft', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123');
    testContext.connection.request = jest.fn(() => Promise.resolve());
    testContext.draft = new Draft(testContext.connection);
    return Promise.onPossiblyUnhandledRejection((e, promise) => {});
  });

  describe('save', () => {
    test('should do a POST request if the draft has no id', () => {
      testContext.draft.id = undefined;
      testContext.draft.save();
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'POST',
        body: {
          id: undefined,
          object: 'draft',
          account_id: undefined,
          to: [],
          cc: [],
          bcc: [],
          from: [],
          date: null,
          body: '',
          files: [],
          unread: undefined,
          snippet: undefined,
          thread_id: undefined,
          subject: '',
          draft: undefined,
          version: undefined,
          folder: undefined,
          labels: [],
          file_ids: [],
        },
        qs: {},
        path: '/drafts',
      });
    });

    test('should do a PUT request if the draft has an id', () => {
      testContext.draft.id = 'id-1234';
      testContext.draft.save();
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'PUT',
        body: {
          id: 'id-1234',
          object: 'draft',
          account_id: undefined,
          to: [],
          cc: [],
          bcc: [],
          from: [],
          date: null,
          body: '',
          files: [],
          unread: undefined,
          snippet: undefined,
          thread_id: undefined,
          subject: '',
          draft: undefined,
          version: undefined,
          folder: undefined,
          labels: [],
          file_ids: [],
        },
        qs: {},
        path: '/drafts/id-1234',
      });
    });

    describe('when the request succeeds', () => {
      beforeEach(() => {
        testContext.connection.request = jest.fn(() => {
          const draftJSON = {
            id: 'id-1234',
            version: 1,
          };
          return Promise.resolve(draftJSON);
        });
      });

      test('should resolve with the draft object', done => {
        testContext.draft.save().then(draft => {
          expect(draft.id).toBe('id-1234');
          expect(draft.version).toBe(1);
          done();
        });
      });

      test('should call the callback with the draft object', done => {
        testContext.draft.save((err, draft) => {
          expect(err).toBe(null);
          expect(draft.id).toBe('id-1234');
          expect(draft.version).toBe(1);
          done();
        });
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        testContext.error = new Error('Network error');
        testContext.connection.request = jest.fn(() =>
          Promise.reject(testContext.error)
        );
      });

      test('should reject with the error', done => {
        testContext.draft.save().catch(err => {
          expect(err).toBe(testContext.error);
          done();
        });
      });

      test('should call the callback with the error', done => {
        testContext.draft
          .save((err, draft) => {
            expect(err).toBe(testContext.error);
            expect(draft).toBe(undefined);
            done();
          })
          .catch(() => {});
      });
    });
  });

  describe('send', () => {
    test('should send the draft_id and version if the draft has an id', () => {
      testContext.draft.id = 'id-1234';
      testContext.draft.version = 2;
      testContext.draft.send();
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'POST',
        body: {
          draft_id: 'id-1234',
          version: 2,
        },
        path: '/send',
      });
    });

    test('should send the draft JSON if the draft has no id', () => {
      testContext.draft.id = undefined;
      testContext.draft.subject = 'Test Subject';
      testContext.draft.send();
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'POST',
        body: {
          id: undefined,
          object: 'draft',
          account_id: undefined,
          to: [],
          cc: [],
          bcc: [],
          from: [],
          date: null,
          body: '',
          files: [],
          unread: undefined,
          snippet: undefined,
          thread_id: undefined,
          subject: 'Test Subject',
          draft: undefined,
          version: undefined,
          folder: undefined,
          labels: [],
          file_ids: [],
        },
        path: '/send',
      });
    });

    describe('when the request succeeds', () => {
      beforeEach(() => {
        testContext.connection.request = jest.fn(() => {
          const draftJSON = {
            id: 'id-1234',
            thread_id: 'new-thread-id',
          };
          return Promise.resolve(draftJSON);
        });
      });

      test('should resolve with the message object', done => {
        testContext.draft.send().then(message => {
          expect(message.id).toBe('id-1234');
          expect(message.threadId).toBe('new-thread-id');
          expect(message).toBeInstanceOf(Message);
          done();
        });
      });

      test('should call the callback with the message object', done => {
        testContext.draft.send((err, message) => {
          expect(err).toBe(null);
          expect(message.id).toBe('id-1234');
          expect(message.threadId).toBe('new-thread-id');
          expect(message).toBeInstanceOf(Message);
          done();
        });
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        testContext.error = new Error('Network error');
        testContext.connection.request = jest.fn(() =>
          Promise.reject(testContext.error)
        );
      });

      test('should reject with the error', done => {
        testContext.draft.send().catch(err => {
          expect(err).toBe(testContext.error);
          done();
        });
      });

      test('should call the callback with the error', done => {
        testContext.draft
          .send((err, message) => {
            expect(err).toBe(testContext.error);
            expect(message).toBe(undefined);
            done();
          })
          .catch(() => {});
      });
    });
  });
});
