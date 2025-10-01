import {
  describe,
  it,
  expect,
  _beforeEach,
  beforeAll,
  _afterEach,
  _afterAll,
  vi,
} from 'vitest';
import APIClient from '../../src/apiClient';
import { Attachments } from '../../src/resources/attachments';
import { Readable } from 'stream';

vi.mock('../../src/apiClient');

describe('Attachments', () => {
  let apiClient: any;
  let attachments: Attachments;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as any;

    attachments = new Attachments(apiClient);
    apiClient.request.mockResolvedValue({});
    apiClient.requestRaw.mockResolvedValue(Buffer.from(''));

    const mockStream = new Readable();
    apiClient.requestStream.mockResolvedValue(Promise.resolve(mockStream));
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
});
