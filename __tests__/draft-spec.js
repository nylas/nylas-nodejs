import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Draft from '../src/models/draft';
import Message from '../src/models/message';

describe('Draft', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: "foo"});
    testContext.connection.request = jest.fn(() => Promise.resolve({}));
    testContext.draft = new Draft(testContext.connection);
  });

  describe('save', () => {
    test('should do a POST request if the draft has no id', done => {
      testContext.draft.id = undefined;
      testContext.draft.save().then(() => {
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
            events: [],
            unread: undefined,
            snippet: undefined,
            thread_id: undefined,
            subject: '',
            version: undefined,
            folder: undefined,
            labels: [],
            file_ids: [],
            headers: undefined,
            reply_to: [],
            reply_to_message_id: undefined,
          },
          qs: {},
          path: '/drafts',
        });
        done();
      });
    });

    test('should do a PUT request if the draft has an id', done => {
      testContext.draft.id = 'id-1234';
      testContext.draft.save().then(() => {
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
            events: [],
            unread: undefined,
            snippet: undefined,
            thread_id: undefined,
            subject: '',
            version: undefined,
            folder: undefined,
            labels: [],
            file_ids: [],
            headers: undefined,
            reply_to: [],
            reply_to_message_id: undefined,
          },
          qs: {},
          path: '/drafts/id-1234',
        });
        done();
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
    test('should send the draft_id and version if the draft has an id', done => {
      testContext.draft.id = 'id-1234';
      testContext.draft.version = 2;
      testContext.draft.send().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            draft_id: 'id-1234',
            version: 2,
          },
          path: '/send',
          headers: {},
          json: true,
        });
        done();
      });
    });

    test('should send the draft JSON if the draft has no id', done => {
      testContext.draft.id = undefined;
      testContext.draft.subject = 'Test Subject';
      testContext.draft.send().then(() => {
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
            events: [],
            unread: undefined,
            snippet: undefined,
            thread_id: undefined,
            subject: 'Test Subject',
            version: undefined,
            folder: undefined,
            labels: [],
            file_ids: [],
            headers: undefined,
            reply_to: [],
            reply_to_message_id: undefined,
          },
          path: '/send',
          headers: {},
          json: true,
        });
        done();
      });
    });

    test('should send the draft as raw MIME if rawMime exists', done => {
      const msg = `MIME-Version: 1.0 \
Content-Type: text/plain; charset=UTF-8 \
In-Reply-To: <84umizq7c4jtrew491brpa6iu-0@mailer.nylas.com> \
References: <84umizq7c4jtrew491brpa6iu-0@mailer.nylas.com> \
Subject: Meeting on Thursday \
From: Bill <wbrogers@mit.edu> \
To: Ben Bitdiddle <ben.bitdiddle@gmail.com> \
\
Hey Ben, \
\
Would you like to grab coffee @ 2pm this Thursday?`;

      const draft = testContext.connection.drafts.build({ rawMime: msg });
      draft.send().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          headers: {
            'Content-Type': 'message/rfc822',
          },
          method: 'POST',
          path: '/send',
          body: msg,
          json: false,
        });
        done();
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
