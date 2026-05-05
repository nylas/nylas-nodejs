import APIClient from '../../src/apiClient';
import { Attachments } from '../../src/resources/attachments';
jest.mock('../../src/apiClient');

describe('Attachments', () => {
  let apiClient: jest.Mocked<APIClient>;
  let attachments: Attachments;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    attachments = new Attachments(apiClient);
    apiClient.request.mockResolvedValue({});
    apiClient.requestRaw.mockResolvedValue(Buffer.from(''));

    // Mock Web ReadableStream (native in Node 18+)
    const mockStream = new ReadableStream({
      start(controller: ReadableStreamDefaultController<Uint8Array>): void {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.close();
      },
    });
    apiClient.requestStream.mockResolvedValue(mockStream);
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params for attachment metadata', async () => {
      await attachments.find({
        identifier: 'id123',
        attachmentId: 'attach123',
        queryParams: {
          messageId: 'message123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/attachments/attach123',
        queryParams: {
          messageId: 'message123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode identifier and attachmentId in find', async () => {
      await attachments.find({
        identifier: 'id 123',
        attachmentId: 'attach/123',
        queryParams: { messageId: 'message123' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/attachments/attach%2F123',
        })
      );
    });

    it('should not double encode already-encoded identifier and attachmentId in find', async () => {
      await attachments.find({
        identifier: 'id%20123',
        attachmentId: 'attach%2F123',
        queryParams: { messageId: 'message123' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/attachments/attach%2F123',
        })
      );
    });
  });

  describe('downloadBytes', () => {
    it('should call apiClient.requestRaw with the correct params for downloading an attachment as bytes', async () => {
      await attachments.downloadBytes({
        identifier: 'id123',
        attachmentId: 'attach123',
        queryParams: {
          messageId: 'message123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.requestRaw).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/attachments/attach123/download',
        queryParams: {
          messageId: 'message123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode identifier and attachmentId in downloadBytes', async () => {
      await attachments.downloadBytes({
        identifier: 'id 123',
        attachmentId: 'attach/123',
        queryParams: { messageId: 'message123' },
        overrides: {},
      });
      expect(apiClient.requestRaw).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/attachments/attach%2F123/download',
        })
      );
    });

    it('should not double encode already-encoded identifier and attachmentId in downloadBytes', async () => {
      await attachments.downloadBytes({
        identifier: 'id%20123',
        attachmentId: 'attach%2F123',
        queryParams: { messageId: 'message123' },
        overrides: {},
      });
      expect(apiClient.requestRaw).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/attachments/attach%2F123/download',
        })
      );
    });
  });

  describe('download', () => {
    it('should call apiClient.requestStream with the correct params for streaming an attachment', async () => {
      await attachments.download({
        identifier: 'id123',
        attachmentId: 'attach123',
        queryParams: {
          messageId: 'message123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.requestStream).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/attachments/attach123/download',
        queryParams: {
          messageId: 'message123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode identifier and attachmentId in download', async () => {
      await attachments.download({
        identifier: 'id 123',
        attachmentId: 'attach/123',
        queryParams: { messageId: 'message123' },
        overrides: {},
      });
      expect(apiClient.requestStream).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/attachments/attach%2F123/download',
        })
      );
    });

    it('should not double encode already-encoded identifier and attachmentId in download', async () => {
      await attachments.download({
        identifier: 'id%20123',
        attachmentId: 'attach%2F123',
        queryParams: { messageId: 'message123' },
        overrides: {},
      });
      expect(apiClient.requestStream).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/attachments/attach%2F123/download',
        })
      );
    });
  });

  describe('createUploadSession', () => {
    it('should call apiClient.request with the correct params', async () => {
      const mockResponse = {
        requestId: 'req-1',
        data: {
          attachmentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          method: 'PUT',
          url: 'https://storage.example/upload',
          headers: { 'Content-Type': 'application/pdf' },
          expiresAt: '2026-04-22T19:00:00Z',
          maxSize: 157286400,
          size: 1048576,
          contentType: 'application/pdf',
          filename: 'document.pdf',
          grantId: 'id123',
        },
      };
      apiClient.request.mockResolvedValue(mockResponse);

      const result = await attachments.createUploadSession({
        identifier: 'id123',
        requestBody: {
          filename: 'document.pdf',
          contentType: 'application/pdf',
          size: 1048576,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/attachment-uploads',
        body: {
          filename: 'document.pdf',
          contentType: 'application/pdf',
          size: 1048576,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should omit size in the body when not provided', async () => {
      apiClient.request.mockResolvedValue({ requestId: 'r', data: {} });

      await attachments.createUploadSession({
        identifier: 'id123',
        requestBody: {
          filename: 'doc.pdf',
          contentType: 'application/pdf',
        },
        overrides: {},
      });

      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/v3/grants/id123/attachment-uploads',
          body: {
            filename: 'doc.pdf',
            contentType: 'application/pdf',
          },
        })
      );
    });

    it('should URL encode identifier in createUploadSession path', async () => {
      apiClient.request.mockResolvedValue({ requestId: 'r', data: {} });
      await attachments.createUploadSession({
        identifier: 'id 123',
        requestBody: {
          filename: 'a.pdf',
          contentType: 'application/pdf',
        },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/attachment-uploads',
        })
      );
    });
  });

  describe('completeUploadSession', () => {
    it('should call apiClient.request with POST, complete path, and empty body', async () => {
      const mockResponse = {
        requestId: 'req-1',
        data: {
          attachmentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          grantId: 'id123',
          status: 'ready' as const,
        },
      };
      apiClient.request.mockResolvedValue(mockResponse);

      const result = await attachments.completeUploadSession({
        identifier: 'id123',
        attachmentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/attachment-uploads/a1b2c3d4-e5f6-7890-abcd-ef1234567890/complete',
        body: {},
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should URL encode identifier and attachmentId in completeUploadSession path', async () => {
      apiClient.request.mockResolvedValue({ requestId: 'r', data: {} });
      await attachments.completeUploadSession({
        identifier: 'id 123',
        attachmentId: 'att/id',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/attachment-uploads/att%2Fid/complete',
        })
      );
    });
  });
});
