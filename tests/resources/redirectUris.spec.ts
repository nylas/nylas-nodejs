import { beforeAll, describe, expect, it, vi } from 'vitest';
import APIClient from '../../src/apiClient';
import { RedirectUris } from '../../src/resources/redirectUris';

vi.mock('../../src/apiClient');

describe('RedirectUris', () => {
  let apiClient: any;
  let redirectUris: RedirectUris;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://api.nylas.com',
      timeout: 30,
      headers: {},
    }) as any;

    redirectUris = new RedirectUris(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await redirectUris.list({
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/applications/redirect-uris',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should call apiClient.request even without overrides set', async () => {
      await redirectUris.list();

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/applications/redirect-uris',
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await redirectUris.find({
        redirectUriId: 'redirect123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/applications/redirect-uris/redirect123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode redirectUriId in find', async () => {
      await redirectUris.find({
        redirectUriId: 'redirect/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/applications/redirect-uris/redirect%2F123',
        })
      );
    });

    it('should not double encode already-encoded redirectUriId in find', async () => {
      await redirectUris.find({
        redirectUriId: 'redirect%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/applications/redirect-uris/redirect%2F123',
        })
      );
    });
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      await redirectUris.create({
        requestBody: {
          url: 'https://test.com',
          platform: 'google',
          settings: {
            origin: 'https://origin.com',
            bundleId: 'com.test',
            appStoreId: '123',
            teamId: '123',
            packageName: 'com.test',
            sha1CertificateFingerprint: 'abc123',
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/applications/redirect-uris',
        body: {
          url: 'https://test.com',
          platform: 'google',
          settings: {
            origin: 'https://origin.com',
            bundleId: 'com.test',
            appStoreId: '123',
            teamId: '123',
            packageName: 'com.test',
            sha1CertificateFingerprint: 'abc123',
          },
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
      await redirectUris.update({
        redirectUriId: 'redirect123',
        requestBody: {
          url: 'https://test.com',
          platform: 'google',
          settings: {
            origin: 'https://origin.com',
            bundleId: 'com.test',
            appStoreId: '123',
            teamId: '123',
            packageName: 'com.test',
            sha1CertificateFingerprint: 'abc123',
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/applications/redirect-uris/redirect123',
        body: {
          url: 'https://test.com',
          platform: 'google',
          settings: {
            origin: 'https://origin.com',
            bundleId: 'com.test',
            appStoreId: '123',
            teamId: '123',
            packageName: 'com.test',
            sha1CertificateFingerprint: 'abc123',
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode redirectUriId in update', async () => {
      await redirectUris.update({
        redirectUriId: 'redirect/123',
        requestBody: {
          url: 'https://test.com',
          platform: 'google',
          settings: {},
        },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/applications/redirect-uris/redirect%2F123',
        })
      );
    });

    it('should not double encode already-encoded redirectUriId in update', async () => {
      await redirectUris.update({
        redirectUriId: 'redirect%2F123',
        requestBody: {
          url: 'https://test.com',
          platform: 'google',
          settings: {},
        },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/applications/redirect-uris/redirect%2F123',
        })
      );
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await redirectUris.destroy({
        redirectUriId: 'redirect123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/applications/redirect-uris/redirect123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode redirectUriId in destroy', async () => {
      await redirectUris.destroy({
        redirectUriId: 'redirect/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/applications/redirect-uris/redirect%2F123',
        })
      );
    });

    it('should not double encode already-encoded redirectUriId in destroy', async () => {
      await redirectUris.destroy({
        redirectUriId: 'redirect%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/applications/redirect-uris/redirect%2F123',
        })
      );
    });
  });
});
