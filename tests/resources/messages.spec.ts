import APIClient from '../../src/apiClient';
import { Messages } from '../../src/resources/messages';
import { createReadableStream, MockedFormData } from '../testUtils';
import { CreateAttachmentRequest } from '../../src/models/attachments';
import {
  MessageFields,
  Message,
  MessageTrackingOptions,
} from '../../src/models/messages';
jest.mock('../../src/apiClient');

// Mock the FormData constructor
jest.mock('formdata-node', () => ({
  FormData: jest.fn().mockImplementation(function (this: MockedFormData) {
    const appendedData: Record<string, any> = {};

    this.append = (key: string, value: any): void => {
      appendedData[key] = value;
    };

    this._getAppendedData = (): Record<string, any> => appendedData;
  }),
  Blob: jest.fn().mockImplementation((parts: any[], options?: any) => ({
    type: options?.type || '',
    size: parts.reduce((size, part) => size + (part.length || 0), 0),
  })),
  File: jest
    .fn()
    .mockImplementation((parts: any[], name: string, options?: any) => ({
      name,
      type: options?.type || '',
      size:
        options?.size ||
        parts.reduce((size, part) => size + (part.length || 0), 0),
      stream: (): NodeJS.ReadableStream => parts[0],
      [Symbol.toStringTag]: 'File',
    })),
}));

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

    it('should call apiClient.request with fields=include_headers for list', async () => {
      await messages.list({
        identifier: 'id123',
        queryParams: {
          fields: MessageFields.INCLUDE_HEADERS,
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages',
        overrides: undefined,
        queryParams: {
          fields: MessageFields.INCLUDE_HEADERS,
        },
      });
    });

    it('should call apiClient.request with fields=standard for list', async () => {
      await messages.list({
        identifier: 'id123',
        queryParams: {
          fields: MessageFields.STANDARD,
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages',
        overrides: undefined,
        queryParams: {
          fields: MessageFields.STANDARD,
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

    it('should call apiClient.request with fields=include_tracking_options', async () => {
      await messages.find({
        identifier: 'id123',
        messageId: 'message123',
        queryParams: {
          fields: MessageFields.INCLUDE_TRACKING_OPTIONS,
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages/message123',
        overrides: undefined,
        queryParams: {
          fields: MessageFields.INCLUDE_TRACKING_OPTIONS,
        },
      });
    });

    it('should call apiClient.request with fields=raw_mime', async () => {
      await messages.find({
        identifier: 'id123',
        messageId: 'message123',
        queryParams: {
          fields: MessageFields.RAW_MIME,
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages/message123',
        overrides: undefined,
        queryParams: {
          fields: MessageFields.RAW_MIME,
        },
      });
    });

    it('should call apiClient.request with fields=include_headers for list', async () => {
      await messages.list({
        identifier: 'id123',
        queryParams: {
          fields: MessageFields.INCLUDE_HEADERS,
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages',
        overrides: undefined,
        queryParams: {
          fields: MessageFields.INCLUDE_HEADERS,
        },
      });
    });

    it('should call apiClient.request with fields=standard for list', async () => {
      await messages.list({
        identifier: 'id123',
        queryParams: {
          fields: MessageFields.STANDARD,
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/messages',
        overrides: undefined,
        queryParams: {
          fields: MessageFields.STANDARD,
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
      // ReadableStream is now wrapped in a file-like object
      expect(formData.file0).toEqual({
        type: 'text/plain',
        name: 'file1.txt',
        size: 3145728, // 3MB as declared in the attachment
        stream: expect.any(Function),
        [Symbol.toStringTag]: 'File',
      });
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/messages/send');
      expect(capturedRequest.overrides).toEqual({
        apiUri: 'https://test.api.nylas.com',
        headers: { override: 'bar' },
      });
    });

    it('should use multipart when total payload (body + attachments) exceeds 3MB', async () => {
      // Create a large message body that, combined with small attachments, exceeds 3MB
      const largeBody = 'A'.repeat(3.5 * 1024 * 1024); // 3.5MB body
      const messageJson = {
        to: [{ name: 'Test', email: 'test@example.com' }],
        subject: 'This is my test email with large content',
        body: largeBody,
      };

      const fileStream = createReadableStream('Small attachment content');
      const smallAttachment: CreateAttachmentRequest = {
        filename: 'small_file.txt',
        contentType: 'text/plain',
        content: fileStream,
        size: 1000, // 1KB attachment - small but total payload > 3MB
      };

      await messages.send({
        identifier: 'id123',
        requestBody: {
          ...messageJson,
          attachments: [smallAttachment],
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];

      // Should use form data because total payload exceeds 3MB
      expect(capturedRequest.form).toBeDefined();
      expect(capturedRequest.body).toBeUndefined();

      const formData = (
        capturedRequest.form as any as MockedFormData
      )._getAppendedData();
      expect(formData.message).toEqual(JSON.stringify(messageJson));
      // ReadableStream is now wrapped in a file-like object
      expect(formData.file0).toEqual({
        type: 'text/plain',
        name: 'small_file.txt',
        size: 1000, // 1KB as declared in the attachment
        stream: expect.any(Function),
        [Symbol.toStringTag]: 'File',
      });
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/messages/send');
    });

    it('should use JSON when total payload (body + attachments) is under 3MB', async () => {
      // Create a message with body + attachments under 3MB
      const smallBody = 'Small message content';
      const messageJson = {
        to: [{ name: 'Test', email: 'test@example.com' }],
        subject: 'This is my test email',
        body: smallBody,
      };

      const smallAttachment: CreateAttachmentRequest = {
        filename: 'small_file.txt',
        contentType: 'text/plain',
        content: createReadableStream('Small attachment content'),
        size: 1000, // 1KB attachment
      };

      await messages.send({
        identifier: 'id123',
        requestBody: {
          ...messageJson,
          attachments: [smallAttachment],
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];

      // Should use JSON body because total payload is under 3MB
      expect(capturedRequest.body).toBeDefined();
      expect(capturedRequest.form).toBeUndefined();
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/messages/send');
    });

    it('should include isPlaintext in JSON body when provided', async () => {
      const jsonBody = {
        to: [{ name: 'Test', email: 'test@example.com' }],
        subject: 'Plain text email',
        body: 'Hello world',
        isPlaintext: true,
      };

      await messages.send({
        identifier: 'id123',
        requestBody: jsonBody,
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/messages/send');
      expect(capturedRequest.body).toEqual(jsonBody);
    });

    it('should include isPlaintext in multipart form message when provided', async () => {
      const messageJson = {
        to: [{ name: 'Test', email: 'test@example.com' }],
        subject: 'Plain text email',
        body: 'Hello world',
        isPlaintext: true,
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
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      const formData = (
        capturedRequest.form as any as MockedFormData
      )._getAppendedData();
      const parsed = JSON.parse(formData.message);
      expect(parsed.to).toEqual(messageJson.to);
      expect(parsed.subject).toEqual(messageJson.subject);
      expect(parsed.body).toEqual(messageJson.body);
      expect(parsed.is_plaintext).toBe(true);
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/messages/send');
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

  describe('MessageTrackingOptions interface', () => {
    it('should have the correct structure for MessageTrackingOptions', () => {
      const trackingOptions: MessageTrackingOptions = {
        opens: true,
        threadReplies: false,
        links: true,
        label: 'Test tracking label',
      };

      expect(trackingOptions.opens).toBe(true);
      expect(trackingOptions.threadReplies).toBe(false);
      expect(trackingOptions.links).toBe(true);
      expect(trackingOptions.label).toBe('Test tracking label');
    });

    it('should allow Message interface to include trackingOptions', () => {
      const message: Partial<Message> = {
        id: 'message123',
        grantId: 'grant123',
        object: 'message',
        date: 1234567890,
        folders: ['folder1'],
        to: [{ name: 'Test User', email: 'test@example.com' }],
        trackingOptions: {
          opens: true,
          threadReplies: false,
          links: true,
          label: 'Test tracking',
        },
      };

      expect(message.trackingOptions).toBeDefined();
      expect(message.trackingOptions?.opens).toBe(true);
      expect(message.trackingOptions?.threadReplies).toBe(false);
      expect(message.trackingOptions?.links).toBe(true);
      expect(message.trackingOptions?.label).toBe('Test tracking');
    });

    it('should allow Message interface to include rawMime', () => {
      const message: Partial<Message> = {
        id: 'message123',
        grantId: 'grant123',
        object: 'message',
        rawMime: 'base64-encoded-mime-content-example',
      };

      expect(message.rawMime).toBeDefined();
      expect(message.rawMime).toBe('base64-encoded-mime-content-example');
    });

    it('should allow Message interface to include both trackingOptions and rawMime', () => {
      const message: Partial<Message> = {
        id: 'message123',
        grantId: 'grant123',
        object: 'message',
        date: 1234567890,
        folders: ['folder1'],
        to: [{ name: 'Test User', email: 'test@example.com' }],
        trackingOptions: {
          opens: true,
          threadReplies: false,
          links: true,
          label: 'Test tracking',
        },
        rawMime: 'base64-encoded-mime-content-example',
      };

      expect(message.trackingOptions).toBeDefined();
      expect(message.rawMime).toBeDefined();
      expect(message.rawMime).toBe('base64-encoded-mime-content-example');
    });
  });
});
