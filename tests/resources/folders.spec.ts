import APIClient from '../../src/apiClient';
import { Folders } from '../../src/resources/folders';
import { objKeysToCamelCase } from '../../src/utils';
vi.mock('../../src/apiClient');

import { describe, it, expect, beforeEach, beforeAll, afterEach, afterAll, vi } from 'vitest';

describe('Folders', () => {
  let apiClient: any;
  let folders: Folders;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as any;

    folders = new Folders(apiClient);
    apiClient.request.mockResolvedValue({ data: [] });
  });

  describe('deserializing', () => {
    it('should return a folder object as expected', () => {
      const apiFolder = {
        id: 'SENT',
        grant_id: '41009df5-bf11-4c97-aa18-b285b5f2e386',
        name: 'SENT',
        system_folder: true,
        object: 'folder',
        unread_count: 0,
        child_count: 0,
        parent_id: 'ascsf21412',
        background_color: '#039BE5',
        text_color: '#039BE5',
        total_count: 0,
        attributes: ['\\SENT'],
      };

      const folder = objKeysToCamelCase(apiFolder);
      expect(folder).toEqual({
        id: 'SENT',
        grantId: '41009df5-bf11-4c97-aa18-b285b5f2e386',
        name: 'SENT',
        systemFolder: true,
        object: 'folder',
        unreadCount: 0,
        childCount: 0,
        parentId: 'ascsf21412',
        backgroundColor: '#039BE5',
        textColor: '#039BE5',
        totalCount: 0,
        attributes: ['\\SENT'],
      });
    });
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await folders.list({
        identifier: 'id123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/folders',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should call apiClient.request with query params including single_level', async () => {
      await folders.list({
        identifier: 'id123',
        queryParams: {
          includeHiddenFolders: true,
          singleLevel: true,
          parentId: 'parent123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/folders',
        queryParams: {
          includeHiddenFolders: true,
          singleLevel: true,
          parentId: 'parent123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should call apiClient.request with all supported query parameters', async () => {
      await folders.list({
        identifier: 'id123',
        queryParams: {
          parentId: 'parent123',
          includeHiddenFolders: false,
          limit: 10,
          pageToken: 'token123',
          singleLevel: false,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/folders',
        queryParams: {
          parentId: 'parent123',
          includeHiddenFolders: false,
          limit: 10,
          pageToken: 'token123',
          singleLevel: false,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await folders.find({
        identifier: 'id123',
        folderId: 'folder123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/folders/folder123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode identifier and folderId in find', async () => {
      await folders.find({
        identifier: 'id 123',
        folderId: 'folder/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/folders/folder%2F123',
        })
      );
    });

    it('should not double encode already-encoded identifier and folderId in find', async () => {
      await folders.find({
        identifier: 'id%20123',
        folderId: 'folder%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/folders/folder%2F123',
        })
      );
    });
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      await folders.create({
        identifier: 'id123',
        requestBody: {
          name: 'My Folder',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/folders',
        body: {
          name: 'My Folder',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params', async () => {
      await folders.update({
        identifier: 'id123',
        folderId: 'folder123',
        requestBody: {
          name: 'Updated Folder',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/grants/id123/folders/folder123',
        body: {
          name: 'Updated Folder',
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
      await folders.destroy({
        identifier: 'id123',
        folderId: 'folder123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/folders/folder123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });
});
