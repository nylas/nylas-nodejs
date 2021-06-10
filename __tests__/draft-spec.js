import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Draft from '../src/models/draft';
import Message from '../src/models/message';

describe('Draft', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
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
            to: [],
            cc: [],
            bcc: [],
            from: [],
            date: null,
            body: undefined,
            events: [],
            unread: undefined,
            snippet: undefined,
            thread_id: undefined,
            subject: undefined,
            version: undefined,
            folder: undefined,
            starred: undefined,
            labels: [],
            file_ids: [],
            headers: undefined,
            reply_to: [],
            reply_to_message_id: undefined
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
            to: [],
            cc: [],
            bcc: [],
            from: [],
            date: null,
            body: undefined,
            events: [],
            unread: undefined,
            snippet: undefined,
            thread_id: undefined,
            subject: undefined,
            version: undefined,
            folder: undefined,
            starred: undefined,
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

    test('should send the draft JSON with the tracking object if the draft has an id and has a tracking object passed in', done => {
      testContext.draft.id = 'id-1234';
      testContext.draft.version = 2;
      testContext.draft.send({"opens": true}).then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            draft_id: 'id-1234',
            version: 2,
            tracking: {"opens": true}
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
            to: [],
            cc: [],
            bcc: [],
            from: [],
            date: null,
            body: undefined,
            events: [],
            unread: undefined,
            snippet: undefined,
            thread_id: undefined,
            subject: 'Test Subject',
            version: undefined,
            folder: undefined,
            starred: undefined,
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

    test('should send the draft JSON with the tracking object if the draft has no id and has a tracking object passed in as the second parameter', done => {
      testContext.draft.id = undefined;
      testContext.draft.subject = 'Test Subject';
      testContext.draft.send(null, {"opens": true}).then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            to: [],
            cc: [],
            bcc: [],
            from: [],
            date: null,
            body: undefined,
            events: [],
            unread: undefined,
            snippet: undefined,
            thread_id: undefined,
            subject: 'Test Subject',
            version: undefined,
            folder: undefined,
            starred: undefined,
            labels: [],
            file_ids: [],
            headers: undefined,
            reply_to: [],
            reply_to_message_id: undefined,
            tracking: {"opens": true}
          },
          path: '/send',
          headers: {},
          json: true,
        });
        done();
      });
    });

    test('should send the draft JSON with the tracking object if the draft has a tracking object as the only parameter', done => {
      testContext.draft.id = undefined;
      testContext.draft.subject = 'Test Subject';
      testContext.draft.send({"opens": true}).then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            to: [],
            cc: [],
            bcc: [],
            from: [],
            date: null,
            body: undefined,
            events: [],
            unread: undefined,
            snippet: undefined,
            thread_id: undefined,
            subject: 'Test Subject',
            version: undefined,
            folder: undefined,
            starred: undefined,
            labels: [],
            file_ids: [],
            headers: undefined,
            reply_to: [],
            reply_to_message_id: undefined,
            tracking: {"opens": true}
          },
          path: '/send',
          headers: {},
          json: true,
        });
        done();
      });
    });

    test('should send the draft JSON with the tracking object if the draft has no id and has a tracking object passed in as the first parameter', done => {
      testContext.draft.id = undefined;
      testContext.draft.subject = 'Test Subject';
      testContext.draft.send({"opens": true}, (err, data) => {}).then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            to: [],
            cc: [],
            bcc: [],
            from: [],
            date: null,
            body: undefined,
            events: [],
            unread: undefined,
            snippet: undefined,
            thread_id: undefined,
            subject: 'Test Subject',
            version: undefined,
            folder: undefined,
            starred: undefined,
            labels: [],
            file_ids: [],
            headers: undefined,
            reply_to: [],
            reply_to_message_id: undefined,
            tracking: {"opens": true}
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

      test('should call the callback when tracking object is passed as first argument', done => {
        testContext.draft.send({"opens": true}, (err, message) => {
          expect(err).toBe(null);
          expect(message.id).toBe('id-1234');
          expect(message.threadId).toBe('new-thread-id');
          expect(message).toBeInstanceOf(Message);
          done();
        });
      });

      test('should call the callback when tracking object is passed as second argument', done => {
        testContext.draft.send((err, message) => {
          expect(err).toBe(null);
          expect(message.id).toBe('id-1234');
          expect(message.threadId).toBe('new-thread-id');
          expect(message).toBeInstanceOf(Message);
          done();
        }, {"opens": true});
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
