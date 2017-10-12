import Promise from 'bluebird';
import request from 'request';
import _ from 'underscore';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Thread from '../src/models/thread';
import Message from '../src/models/message';
import { Label } from '../src/models/folder';

const testUntil = function(fn) {
  let finished = false;
  runs(() => fn(callback => (finished = true)));
  waitsFor(() => finished);
};

describe('Thread', function() {
  beforeEach(function() {
    this.connection = new NylasConnection('123');
    this.thread = new Thread(this.connection);
    this.thread.id = '4333';
    this.thread.starred = true;
    this.thread.unread = false;
    return Promise.onPossiblyUnhandledRejection(function(e, promise) {});
  });

  describe('save', function() {
    it('should do a PUT request with labels if labels is defined', function() {
      const label = new Label(this.connection);
      label.id = 'label_id';
      this.thread.labels = [label];
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.thread.save();
      expect(this.connection.request).toHaveBeenCalledWith({
        method: 'PUT',
        body: {
          label_ids: ['label_id'],
          starred: true,
          unread: false,
        },
        qs: {},
        path: '/threads/4333',
      });
    });

    it('should do a PUT with folder if folder is defined', function() {
      const label = new Label(this.connection);
      label.id = 'label_id';
      this.thread.folder = label;
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.thread.save();
      expect(this.connection.request).toHaveBeenCalledWith({
        method: 'PUT',
        body: {
          folder_id: 'label_id',
          starred: true,
          unread: false,
        },
        qs: {},
        path: '/threads/4333',
      });
    });
  });

  describe('fromJSON', () =>
    it('should populate messages and draft fields when receiving expanded thread', function() {
      const m1 = {
        id: 'm1',
        object: 'message',
        to: [{ name: 'Ben Bitdiddle', email: 'ben.bitdiddle@gmail.com' }],
      };
      const m2 = {
        id: 'm2',
        object: 'message',
        to: [{ name: 'Alice', email: 'alice@gmail.com' }],
      };
      const draft = {
        id: 'm3',
        object: 'draft',
        to: [{ name: 'Bob', email: 'bob@gmail.com' }],
      };

      const t = this.thread.fromJSON({ messages: [m1, m2], drafts: [draft] });
      expect(t.messages).toBeDefined();
      expect(t.messages[0] instanceof Message).toBe(true);
      expect(t.messages[0].id).toBe('m1');
      expect(t.messages[1] instanceof Message).toBe(true);
      expect(t.messages[1].id).toBe('m2');
      expect(t.drafts[0] instanceof Message).toBe(true);
      expect(t.drafts[0].id).toBe('m3');
      expect(t.drafts[0].draft).toBe(true);
    }));
});
