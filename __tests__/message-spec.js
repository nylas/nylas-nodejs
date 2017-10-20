import Promise from 'bluebird';
import request from 'request';
import _ from 'underscore';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Message from '../src/models/message';
import { Label } from '../src/models/folder';

describe('Message', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123');
    testContext.connection.request = jest.fn(() => Promise.resolve());
    testContext.message = new Message(testContext.connection);
    testContext.message.id = '4333';
    testContext.message.starred = true;
    testContext.message.unread = false;
    return Promise.onPossiblyUnhandledRejection(function(e, promise) {});
  });

  describe('save', () => {
    test('should do a PUT request with labels if labels is defined. Additional arguments should be ignored.', () => {
      const label = new Label(testContext.connection);
      label.id = 'label_id';
      testContext.message.labels = [label];
      testContext.message.randomArgument = true;
      testContext.message.save().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
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
    });

    test('should do a PUT with folder if folder is defined', () => {
      const label = new Label(testContext.connection);
      label.id = 'label_id';
      testContext.message.folder = label;
      testContext.message.save().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
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
  });

  describe('getRaw', () =>
    test('should support getting raw messages', () => {
      testContext.connection.request = jest.fn(() => Promise.resolve('MIME'));
      testContext.message.getRaw().then(rawMessage => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          headers: {
            Accept: 'message/rfc822',
          },
          method: 'GET',
          path: '/messages/4333',
        });
        expect(rawMessage).toBe('MIME');
      });
    }));

  describe('sendRaw', () =>
    test('should support sending with raw MIME', () => {
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

      Message.sendRaw(testContext.connection, msg).then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          headers: {
            'Content-Type': 'message/rfc822',
          },
          method: 'POST',
          path: '/send',
          body: msg,
          json: false,
        });
      });
    }));
});
