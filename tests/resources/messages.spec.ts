import APIClient from '../../src/apiClient';
import { Messages } from '../../src/resources/messages';
import { Readable } from 'stream';
import { CreateFileRequest } from '../../src/models/files';
jest.mock('../src/apiClient');

interface MockedFormData {
  append(key: string, value: any): void;
  _getAppendedData(): Record<string, any>;
}

// Mock the FormData constructor
jest.mock('form-data', () => {
  return jest.fn().mockImplementation(function(this: MockedFormData) {
    const appendedData: Record<string, any> = {};

    this.append = (key: string, value: any): void => {
      appendedData[key] = value;
    };

    this._getAppendedData = (): Record<string, any> => appendedData;
  });
});

function createReadableStream(text: string): NodeJS.ReadableStream {
  return new Readable({
    read(): void {
      this.push(text);
      this.push(null); // indicates EOF
    },
  });
}

describe('Messages', () => {
  let apiClient: jest.Mocked<APIClient>;
  let messages: Messages;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
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
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
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
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages/message123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
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
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/messages/message123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
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
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      const formData = ((capturedRequest.form as any) as MockedFormData)._getAppendedData();
      expect(formData).toEqual({
        message: JSON.stringify(jsonBody),
      });
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/messages/send');
      expect(capturedRequest.overrides).toEqual({
        apiUri: 'https://test.api.nylas.com',
      });
    });

    it('should attach files properly', async () => {
      const messageJson = {
        to: [{ name: 'Test', email: 'test@example.com' }],
        subject: 'This is my test email',
      };
      const fileStream = createReadableStream('This is the text from file 1');
      const file1: CreateFileRequest = {
        filename: 'file1.txt',
        contentType: 'text/plain',
        content: fileStream,
      };

      await messages.send({
        identifier: 'id123',
        requestBody: {
          ...messageJson,
          attachments: [file1],
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      const formData = ((capturedRequest.form as any) as MockedFormData)._getAppendedData();
      expect(formData.message).toEqual(JSON.stringify(messageJson));
      expect(formData.file0).toEqual(fileStream);
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/messages/send');
      expect(capturedRequest.overrides).toEqual({
        apiUri: 'https://test.api.nylas.com',
      });
    });
  });

  describe('scheduledMessages', () => {
    it('listing should call apiClient.request with the correct params', async () => {
      await messages.listScheduledMessages({
        identifier: 'id123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages/schedules',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });

    it('finding should call apiClient.request with the correct params', async () => {
      await messages.findScheduledMessage({
        identifier: 'id123',
        scheduleId: 'schedule123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages/schedules/schedule123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });

    it('stopping should call apiClient.request with the correct params', async () => {
      await messages.stopScheduledMessage({
        identifier: 'id123',
        scheduleId: 'schedule123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/messages/schedules/schedule123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });
  });
});
