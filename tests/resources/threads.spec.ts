import { vi, describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
import APIClient from '../../src/apiClient';
import { Threads } from '../../src/resources/threads';
vi.mock('../../src/apiClient');

describe('Threads', () => {
  let apiClient: any;
  let threads: Threads;

  beforeEach(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as any;

    threads = new Threads(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await threads.list({
        identifier: 'id123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/threads',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should transform anyEmail array into comma-delimited any_email parameter', async () => {
      const mockEmails = ['test1@example.com', 'test2@example.com'];
      await threads.list({
        identifier: 'id123',
        queryParams: {
          anyEmail: mockEmails,
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/threads',
        overrides: undefined,
        queryParams: {
          any_email: mockEmails.join(','),
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
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/threads/thread123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode identifier and threadId in find', async () => {
      await threads.find({
        identifier: 'id 123',
        threadId: 'thread/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/threads/thread%2F123',
        })
      );
    });

    it('should not double encode already-encoded identifier and threadId in find', async () => {
      await threads.find({
        identifier: 'id%20123',
        threadId: 'thread%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/threads/thread%2F123',
        })
      );
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
          headers: { override: 'bar' },
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
          headers: { override: 'bar' },
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
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/threads/thread123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });
});
