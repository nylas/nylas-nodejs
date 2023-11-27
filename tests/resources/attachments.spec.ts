import APIClient from '../../src/apiClient';
import { Attachments } from '../../src/resources/attachments';
import { Readable } from 'stream';
jest.mock('../src/apiClient');

describe('Attachments', () => {
  let apiClient: jest.Mocked<APIClient>;
  let attachments: Attachments;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
    }) as jest.Mocked<APIClient>;

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
        },
      });
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
        },
      });
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
        },
      });
    });
  });
});
