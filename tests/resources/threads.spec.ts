import APIClient from '../../src/apiClient';
import { Threads } from '../../src/resources/threads';
jest.mock('../src/apiClient');

describe('Threads', () => {
  let apiClient: jest.Mocked<APIClient>;
  let threads: Threads;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
    }) as jest.Mocked<APIClient>;

    threads = new Threads(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await threads.list({
        identifier: 'id123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/threads',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await threads.find({
        identifier: 'id123',
        threadId: 'thread123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/threads/thread123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params', async () => {
      await threads.update({
        identifier: 'id123',
        threadId: 'thread123',
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
        path: '/v3/grants/id123/threads/thread123',
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
      await threads.destroy({
        identifier: 'id123',
        threadId: 'thread123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/threads/thread123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });
  });
});
