import Promise from 'bluebird';
import request from 'request';
import _ from 'underscore';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Draft from '../src/models/draft';

const testUntil = function(fn) {
  let finished = false;
  runs(() => fn(callback => (finished = true)));
  waitsFor(() => finished);
};

describe('Draft', function() {
  beforeEach(function() {
    this.connection = new NylasConnection('123');
    this.draft = new Draft(this.connection);
    return Promise.onPossiblyUnhandledRejection(function(e, promise) {});
  });

  describe('save', function() {
    it('should do a POST request if the draft has no id', function() {
      this.draft.id = undefined;
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.draft.save();
      expect(this.connection.request).toHaveBeenCalledWith({
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

    it('should do a PUT request if the draft has an id', function() {
      this.draft.id = 'id-1234';
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.draft.save();
      expect(this.connection.request).toHaveBeenCalledWith({
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

    describe('when the request succeeds', function() {
      beforeEach(function() {
        spyOn(this.connection, 'request').andCallFake(function() {
          const draftJSON = {
            id: 'id-1234',
            version: 1,
          };
          return Promise.resolve(draftJSON);
        });
      });

      it('should resolve with the draft object', function() {
        testUntil(done => {
          this.draft.save().then(function(draft) {
            expect(draft.id).toBe('id-1234');
            expect(draft.version).toBe(1);
            done();
          });
        });
      });

      it('should call the callback with the draft object', function() {
        testUntil(done => {
          this.draft.save(function(err, draft) {
            expect(err).toBe(null);
            expect(draft.id).toBe('id-1234');
            expect(draft.version).toBe(1);
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
          this.draft.save().catch(err => {
            expect(err).toBe(this.error);
            done();
          });
        });
      });

      it('should call the callback with the error', function() {
        testUntil(done => {
          this.draft.save((err, draft) => {
            expect(err).toBe(this.error);
            expect(draft).toBe(undefined);
            done();
          });
        });
      });
    });
  });

  describe('send', function() {
    it('should send the draft_id and version if the draft has an id', function() {
      this.draft.id = 'id-1234';
      this.draft.version = 2;
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.draft.send();
      expect(this.connection.request).toHaveBeenCalledWith({
        method: 'POST',
        body: {
          draft_id: 'id-1234',
          version: 2,
        },
        path: '/send',
      });
    });

    it('should send the draft JSON if the draft has no id', function() {
      this.draft.id = undefined;
      this.draft.subject = 'Test Subject';
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.draft.send();
      expect(this.connection.request).toHaveBeenCalledWith({
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

    describe('when the request succeeds', function() {
      beforeEach(function() {
        spyOn(this.connection, 'request').andCallFake(function() {
          const draftJSON = {
            id: 'id-1234',
            thread_id: 'new-thread-id',
          };
          return Promise.resolve(draftJSON);
        });
      });

      it('should resolve with the draft object', function() {
        testUntil(done => {
          this.draft.save().then(function(draft) {
            expect(draft.id).toBe('id-1234');
            expect(draft.threadId).toBe('new-thread-id');
            done();
          });
        });
      });

      it('should call the callback with the draft object', function() {
        testUntil(done => {
          this.draft.save(function(err, draft) {
            expect(err).toBe(null);
            expect(draft.id).toBe('id-1234');
            expect(draft.threadId).toBe('new-thread-id');
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
          this.draft.save().catch(err => {
            expect(err).toBe(this.error);
            done();
          });
        });
      });

      it('should call the callback with the error', function() {
        testUntil(done => {
          this.draft.save((err, draft) => {
            expect(err).toBe(this.error);
            expect(draft).toBe(undefined);
            done();
          });
        });
      });
    });
  });
});
