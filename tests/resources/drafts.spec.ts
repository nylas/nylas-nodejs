import APIClient from '../../src/apiClient';
import { Drafts } from '../../src/resources/drafts';
import { createReadableStream, MockedFormData } from '../testUtils';
import { CreateAttachmentRequest } from '../../src/models/attachments';
jest.mock('../src/apiClient');

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

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await drafts.list({
        identifier: 'id123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/drafts',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
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
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/drafts/draft123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
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
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/drafts');
      expect(capturedRequest.body).toEqual(jsonBody);
      expect(capturedRequest.overrides).toEqual({
        apiUri: 'https://test.api.nylas.com',
      });
    });

    it('should attach files less than 3mb', async () => {
      const fileStream = createReadableStream('This is the text from file 1');
      const jsonBody = {
        to: [{ name: 'Test', email: 'test@example.com' }],
        subject: 'This is my test email',
        attachments: [
          {
            filename: 'file1.txt',
            contentType: 'text/plain',
            content: fileStream,
            size: 100,
          },
        ],
      };
      await drafts.create({
        identifier: 'id123',
        requestBody: jsonBody,
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/drafts');
      expect(capturedRequest.body).toEqual(jsonBody);
      expect(capturedRequest.overrides).toEqual({
        apiUri: 'https://test.api.nylas.com',
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
      });
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params', async () => {
      const fileStream = createReadableStream('This is the text from file 1');
      const jsonBody = {
        subject: 'updated subject',
        attachments: [
          {
            filename: 'file1.txt',
            contentType: 'text/plain',
            content: fileStream,
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
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      expect(capturedRequest.method).toEqual('PUT');
      expect(capturedRequest.path).toEqual('/v3/grants/id123/drafts/draft123');
      expect(capturedRequest.body).toEqual(jsonBody);
      expect(capturedRequest.overrides).toEqual({
        apiUri: 'https://test.api.nylas.com',
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
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/drafts/draft123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
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
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/drafts/draft123',
        body: {},
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });
  });
});
