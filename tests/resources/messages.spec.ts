import APIClient from '../../src/apiClient';
import { Messages } from '../../src/resources/messages';
import { createReadableStream, MockedFormData } from '../testUtils';
import { CreateAttachmentRequest } from '../../src/models/attachments';
jest.mock('../src/apiClient');

// Mock the FormData constructor
jest.mock('form-data', () => {
  return jest.fn().mockImplementation(function (this: MockedFormData) {
    const appendedData: Record<string, any> = {};

    this.append = (key: string, value: any): void => {
      appendedData[key] = value;
    };

    this._getAppendedData = (): Record<string, any> => appendedData;
  });
});

describe('Messages', () => {
  let apiClient: jest.Mocked<APIClient>;
  let messages: Messages;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    messages = new Messages(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await messages.list({
        identifier: 'id123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should transform anyEmail array into comma-delimited any_email parameter', async () => {
      const mockEmails = ['test1@example.com', 'test2@example.com'];
      await messages.list({
        identifier: 'id123',
        queryParams: {
          anyEmail: mockEmails,
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages',
        overrides: undefined,
        queryParams: {
          any_email: mockEmails.join(','),
        },
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await messages.find({
        identifier: 'id123',
        messageId: 'message123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages/message123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode identifier and messageId in find', async () => {
      await messages.find({
        identifier: 'id 123',
        messageId: 'message/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/messages/message%2F123',
        })
      );
    });

    it('should not double encode already-encoded identifier and messageId in find', async () => {
      await messages.find({
        identifier: 'id%20123',
        messageId: 'message%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/messages/message%2F123',
        })
      );
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params', async () => {
      await messages.update({
        identifier: 'id123',
        messageId: 'message123',
        requestBody: {
          starred: true,
          unread: false,
          folders: ['folder123'],
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/grants/id123/messages/message123',
        body: {
          starred: true,
          unread: false,
          folders: ['folder123'],
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await messages.destroy({
        identifier: 'id123',
        messageId: 'message123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/messages/message123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('send', () => {
    it('should call apiClient.request with the correct params', async () => {
      const jsonBody = {
        to: [{ name: 'Test', email: 'test@example.com' }],
        subject: 'This is my test email',
      };
      await messages.send({
        identifier: 'id123',
        requestBody: jsonBody,
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/messages/send');
      expect(capturedRequest.body).toEqual(jsonBody);
      expect(capturedRequest.overrides).toEqual({
        apiUri: 'https://test.api.nylas.com',
        headers: { override: 'bar' },
      });
    });

    it('should attach files less than 3mb', async () => {
      const baseJson = {
        to: [{ name: 'Test', email: 'test@example.com' }],
        subject: 'This is my test email',
      };
      const jsonBody = {
        ...baseJson,
        attachments: [
          {
            filename: 'file1.txt',
            contentType: 'text/plain',
            content: createReadableStream('This is the text from file 1'),
            size: 100,
          },
        ],
      };
      const expectedJson = {
        ...baseJson,
        attachments: [
          {
            filename: 'file1.txt',
            contentType: 'text/plain',
            content: 'VGhpcyBpcyB0aGUgdGV4dCBmcm9tIGZpbGUgMQ==',
            size: 100,
          },
        ],
      };
      await messages.send({
        identifier: 'id123',
        requestBody: jsonBody,
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/messages/send');
      expect(capturedRequest.body).toEqual(expectedJson);
      expect(capturedRequest.overrides).toEqual({
        apiUri: 'https://test.api.nylas.com',
        headers: { override: 'bar' },
      });
    });

    it('should attach files 3mb+ properly', async () => {
      const messageJson = {
        to: [{ name: 'Test', email: 'test@example.com' }],
        subject: 'This is my test email',
      };
      const fileStream = createReadableStream('This is the text from file 1');
      const file1: CreateAttachmentRequest = {
        filename: 'file1.txt',
        contentType: 'text/plain',
        content: fileStream,
        size: 3 * 1024 * 1024,
      };

      await messages.send({
        identifier: 'id123',
        requestBody: {
          ...messageJson,
          attachments: [file1],
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      const formData = (
        capturedRequest.form as any as MockedFormData
      )._getAppendedData();
      expect(formData.message).toEqual(JSON.stringify(messageJson));
      expect(formData.file0).toEqual(fileStream);
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/messages/send');
      expect(capturedRequest.overrides).toEqual({
        apiUri: 'https://test.api.nylas.com',
        headers: { override: 'bar' },
      });
    });
  });

  describe('scheduledMessages', () => {
    it('listing should call apiClient.request with the correct params', async () => {
      await messages.listScheduledMessages({
        identifier: 'id123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages/schedules',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('finding should call apiClient.request with the correct params', async () => {
      await messages.findScheduledMessage({
        identifier: 'id123',
        scheduleId: 'schedule123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages/schedules/schedule123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('stopping should call apiClient.request with the correct params', async () => {
      await messages.stopScheduledMessage({
        identifier: 'id123',
        scheduleId: 'schedule123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/messages/schedules/schedule123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('cleanMessages', () => {
    it('should call apiClient.request with the correct params', async () => {
      await messages.cleanMessages({
        identifier: 'id123',
        requestBody: {
          messageId: ['message123'],
          ignoreImages: true,
          ignoreLinks: true,
          ignoreTables: true,
          imagesAsMarkdown: true,
          removeConclusionPhrases: true,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/grants/id123/messages/clean',
        body: {
          messageId: ['message123'],
          ignoreImages: true,
          ignoreLinks: true,
          ignoreTables: true,
          imagesAsMarkdown: true,
          removeConclusionPhrases: true,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });
});
