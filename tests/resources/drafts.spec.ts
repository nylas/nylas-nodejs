import APIClient from '../../src/apiClient';
import { CreateAttachmentRequest } from '../../src/models/attachments';
import { Drafts } from '../../src/resources/drafts';
import { objKeysToCamelCase } from '../../src/utils';
import { createReadableStream, MockedFormData } from '../testUtils';
jest.mock('../src/apiClient');

// Mock the FormData constructor
jest.mock('formdata-node', () => {
  return {
    FormData: jest.fn().mockImplementation(() => {
      const appendedData: Record<string, any> = {};

      const mockFormData: MockedFormData = {
        append(key: string, value: any): void {
          if (value && typeof value === 'object' && 'content' in value) {
            // Handle File objects
            appendedData[key] = value.content;
          } else {
            appendedData[key] = value;
          }
        },
        _getAppendedData(): Record<string, any> {
          return appendedData;
        },
        form: null as any, // Will be set to self
      };

      // Set form to reference self to handle form property access
      mockFormData.form = mockFormData;

      return mockFormData;
    }),
    File: jest.fn().mockImplementation((content: any[], name: string) => ({
      content,
      name,
    })),
    Blob: jest.fn(),
  };
});

describe('Drafts', () => {
  let apiClient: jest.Mocked<APIClient>;
  let drafts: Drafts;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    drafts = new Drafts(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('deserializing', () => {
    it('should return a draft object as expected', () => {
      const apiDraft = {
        body: 'Hello, I just sent a message using Nylas!',
        cc: [
          {
            email: 'arya.stark@example.com',
          },
        ],
        attachments: [
          {
            content_type: 'text/calendar',
            id: '4kj2jrcoj9ve5j9yxqz5cuv98',
            size: 1708,
          },
        ],
        folders: ['8l6c4d11y1p4dm4fxj52whyr9', 'd9zkcr2tljpu3m4qpj7l2hbr0'],
        from: [
          {
            name: 'Daenerys Targaryen',
            email: 'daenerys.t@example.com',
          },
        ],
        grant_id: '41009df5-bf11-4c97-aa18-b285b5f2e386',
        id: '5d3qmne77v32r8l4phyuksl2x',
        object: 'draft',
        reply_to: [
          {
            name: 'Daenerys Targaryen',
            email: 'daenerys.t@example.com',
          },
        ],
        snippet: 'Hello, I just sent a message using Nylas!',
        starred: true,
        subject: 'Hello from Nylas!',
        thread_id: '1t8tv3890q4vgmwq6pmdwm8qgsaer',
        to: [
          {
            name: 'Jon Snow',
            email: 'j.snow@example.com',
          },
        ],
        date: 1705084742,
      };

      const draft = objKeysToCamelCase(apiDraft);

      expect(draft).toEqual({
        body: 'Hello, I just sent a message using Nylas!',
        cc: [
          {
            email: 'arya.stark@example.com',
          },
        ],
        attachments: [
          {
            contentType: 'text/calendar',
            id: '4kj2jrcoj9ve5j9yxqz5cuv98',
            size: 1708,
          },
        ],
        folders: ['8l6c4d11y1p4dm4fxj52whyr9', 'd9zkcr2tljpu3m4qpj7l2hbr0'],
        from: [
          {
            name: 'Daenerys Targaryen',
            email: 'daenerys.t@example.com',
          },
        ],
        grantId: '41009df5-bf11-4c97-aa18-b285b5f2e386',
        id: '5d3qmne77v32r8l4phyuksl2x',
        object: 'draft',
        replyTo: [
          {
            name: 'Daenerys Targaryen',
            email: 'daenerys.t@example.com',
          },
        ],
        snippet: 'Hello, I just sent a message using Nylas!',
        starred: true,
        subject: 'Hello from Nylas!',
        threadId: '1t8tv3890q4vgmwq6pmdwm8qgsaer',
        to: [
          {
            name: 'Jon Snow',
            email: 'j.snow@example.com',
          },
        ],
        date: 1705084742,
      });
    });
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await drafts.list({
        identifier: 'id123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/drafts',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await drafts.find({
        identifier: 'id123',
        draftId: 'draft123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/drafts/draft123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      const jsonBody = {
        to: [{ name: 'Test', email: 'test@example.com' }],
        subject: 'This is my test email',
      };
      await drafts.create({
        identifier: 'id123',
        requestBody: jsonBody,
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/drafts');
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
      await drafts.create({
        identifier: 'id123',
        requestBody: jsonBody,
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/drafts');
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

      await drafts.create({
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
      const formData = ((capturedRequest.form as any) as MockedFormData)._getAppendedData();
      expect(formData.message).toEqual(JSON.stringify(messageJson));
      expect(formData.file0).toEqual(fileStream);
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/drafts');
      expect(capturedRequest.overrides).toEqual({
        apiUri: 'https://test.api.nylas.com',
        headers: { override: 'bar' },
      });
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params', async () => {
      const baseJson = {
        subject: 'updated subject',
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
      await drafts.update({
        identifier: 'id123',
        draftId: 'draft123',
        requestBody: jsonBody,
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      expect(capturedRequest.method).toEqual('PUT');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/drafts/draft123');
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

      await drafts.update({
        identifier: 'id123',
        draftId: 'draft123',
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
      const formData = ((capturedRequest.form as any) as MockedFormData)._getAppendedData();
      expect(formData.message).toEqual(JSON.stringify(messageJson));
      expect(formData.file0).toEqual(fileStream);
      expect(capturedRequest.method).toEqual('PUT');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/drafts/draft123');
      expect(capturedRequest.overrides).toEqual({
        apiUri: 'https://test.api.nylas.com',
        headers: { override: 'bar' },
      });
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await drafts.destroy({
        identifier: 'id123',
        draftId: 'draft123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/drafts/draft123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('send', () => {
    it('should call apiClient.request with the correct params', async () => {
      await drafts.send({
        identifier: 'id123',
        draftId: 'draft123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/drafts/draft123',
        body: {},
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });
});
