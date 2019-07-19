import NylasConnection from '../nylas-connection';
import File from '../models/file';
import Message from '../models/message';
import { Label } from '../models/folder';
import RestfulModelCollection from '../models/restful-model-collection';

describe('Message', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
    testContext.message = new Message(testContext.connection);
    testContext.message.id = '4333';
    testContext.message.starred = true;
    testContext.message.unread = false;
    testContext.message.to = [{ email: 'foo', name: 'bar' }];
    testContext.connection.request = jest.fn(() => Promise.resolve(testContext.message.toJSON()));
    testContext.collection = new RestfulModelCollection(Message, testContext.connection);
    testContext.collection._getModelCollection = jest.fn(() => {
      return Promise.resolve([testContext.message]);
    });
  });

  describe('save', () => {
    test('should do a PUT request with labels if labels is defined. Additional arguments should be ignored.', () => {
      const label = new Label(testContext.connection);
      label.id = 'label_id';
      testContext.message.labels = [label];
      testContext.message.randomArgument = true;
      testContext.message
        .save()
        .then(() => {
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
        })
        .catch(() => {});
    });

    test('should do a PUT with folder if folder is defined', () => {
      const label = new Label(testContext.connection);
      label.id = 'label_id';
      testContext.message.folder = label;
      testContext.message
        .save()
        .then(() => {
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
        })
        .catch(() => {});
    });

    test('should resolve with the message object', done => {
      testContext.message.save().then(message => {
        expect(message.id).toBe('4333');
        let toParticipant = message.to[0];
        expect(toParticipant.toJSON()).toEqual({ email: 'foo', name: 'bar' });
        done();
      });
    });
  });

  describe('getRaw', () => {
    test('should support getting raw messages', () => {
      testContext.connection.request = jest.fn(() => Promise.resolve('MIME'));
      testContext.message
        .getRaw()
        .then(rawMessage => {
          expect(testContext.connection.request).toHaveBeenCalledWith({
            headers: {
              Accept: 'message/rfc822',
            },
            method: 'GET',
            path: '/messages/4333',
          });
          expect(rawMessage).toBe('MIME');
        })
        .catch(() => {});
    });
  });

  describe('first', () => {
    test('should resolve with the first item', done => {
      const fileObj = {
        account_id: 'foo',
        content_disposition: 'inline',
        content_id: 'bar',
        content_type: 'image/png',
        filename: 'foobar.png',
        id: 'file_id',
        object: 'file',
        message_ids: [],
        size: 123,
      };
      const file = new File(testContext.connection, fileObj);
      testContext.message.files = [file];
      testContext.collection.first().then(message => {
        expect(message instanceof Message).toBe(true);
        expect(message).toBe(testContext.message);
        let file = message.files[0];
        expect(file.toJSON()).toEqual(fileObj);
        expect(file.contentDisposition).toEqual(fileObj.content_disposition);
        done();
      });
    });
  });
});
