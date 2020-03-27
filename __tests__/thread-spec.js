import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Thread from '../src/models/thread';
import Message from '../src/models/message';
import { Folder, Label } from '../src/models/folder';
import EmailParticipant from '../src/models/email-participant';

describe('Thread', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
    testContext.connection.request = jest.fn(() => Promise.resolve());
    testContext.thread = new Thread(testContext.connection);
    testContext.thread.id = '4333';
    testContext.thread.starred = true;
    testContext.thread.unread = false;
  });

  describe('save', () => {
    test('should do a PUT request with labels if labels is defined', () => {
      const label = new Label(testContext.connection);
      label.id = 'label_id';
      testContext.thread.labels = [label];
      testContext.thread
        .save()
        .then(() =>
          expect(testContext.connection.request).toHaveBeenCalledWith({
            method: 'PUT',
            body: {
              label_ids: ['label_id'],
              starred: true,
              unread: false,
            },
            qs: {},
            path: '/threads/4333',
          })
        )
        .catch(() => {});
    });

    test('should do a PUT with folder if folder is defined', () => {
      const label = new Label(testContext.connection);
      label.id = 'label_id';
      testContext.thread.folders = [label];
      testContext.thread.save();
      expect(testContext.connection.request).toHaveBeenCalledWith({
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

  describe('fromJSON', () => {
    test('should populate messages, draft & folder fields when receiving expanded thread', () => {
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
      const folder = {
        'display_name': 'Inbox',
        'id': 'f1',
        'name': 'inbox'
      };

      const t = testContext.thread.fromJSON({
        messages: [m1, m2],
        drafts: [draft],
        folders: [folder]
      });

      expect(t.messages).toBeDefined();
      expect(t.messages[0] instanceof Message).toBe(true);
      expect(t.messages[0].id).toBe('m1');
      expect(t.messages[1] instanceof Message).toBe(true);
      expect(t.messages[1].id).toBe('m2');
      expect(t.drafts[0] instanceof Message).toBe(true);
      expect(t.drafts[0].id).toBe('m3');
      expect(t.folders[0] instanceof Folder).toBe(true);
      expect(t.folders[0].id).toBe('f1');
    });
    test('should populate participants', () => {
      const participants = [
        {
          "email": "anna@yahoo.com",
          "name": "Anna"
        }
      ]
      const t = testContext.thread.fromJSON({
        participants: participants,
      });

      expect(t.participants).toBeDefined();
      expect(t.participants[0] instanceof EmailParticipant).toBe(true);
      expect(t.participants[0].email).toBe('anna@yahoo.com');
      expect(t.participants[0].name).toBe('Anna');
    });
  });
});
