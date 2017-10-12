import Promise from 'bluebird';
import request from 'request';
import _ from 'underscore';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Message from '../src/models/message';
import { Label } from '../src/models/folder';

const testUntil = function(fn) {
  let finished = false;
  runs(() => fn(callback => (finished = true)));
  waitsFor(() => finished);
};

describe('Message', function() {
  beforeEach(function() {
    this.connection = new NylasConnection('123');
    this.message = new Message(this.connection);
    this.message.id = '4333';
    this.message.starred = true;
    this.message.unread = false;
    return Promise.onPossiblyUnhandledRejection(function(e, promise) {});
  });

  describe('save', function() {
    it('should do a PUT request with labels if labels is defined. Additional arguments should be ignored.', function() {
      const label = new Label(this.connection);
      label.id = 'label_id';
      this.message.labels = [label];
      this.message.randomArgument = true;
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.message.save();
      expect(this.connection.request).toHaveBeenCalledWith({
        method: 'PUT',
        body: {
          label_ids: ['label_id'],
          starred: true,
          unread: false,
        },
        qs: {},
        path: '/messages/4333',
      });
    });

    it('should do a PUT with folder if folder is defined', function() {
      const label = new Label(this.connection);
      label.id = 'label_id';
      this.message.folder = label;
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.message.save();
      expect(this.connection.request).toHaveBeenCalledWith({
        method: 'PUT',
        body: {
          folder_id: 'label_id',
          starred: true,
          unread: false,
        },
        qs: {},
        path: '/messages/4333',
      });
    });
  });

  describe('sendRaw', () =>
    it('should support sending with raw MIME', function() {
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

      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve({}));
      Message.sendRaw(this.connection, msg);
      expect(this.connection.request).toHaveBeenCalledWith({
        headers: {
          'Content-Type': 'message/rfc822',
        },
        method: 'POST',
        path: '/send',
        body: msg,
        json: false,
      });
    }));
});
