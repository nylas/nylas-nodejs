import APIClient from '../../src/apiClient';
import { Grants } from '../../src/resources/grants';
jest.mock('../../src/apiClient');

describe('Grants', () => {
  let apiClient: jest.Mocked<APIClient>;
  let grants: Grants;

  beforeEach(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    grants = new Grants(apiClient);

    // Create a spy implementation that captures the inputs
    apiClient.request = jest.fn().mockImplementation(input => {
      // eslint-disable-next-line no-console
      console.log('Request input:', JSON.stringify(input, null, 2));
      return Promise.resolve({
        data: [],
      });
    });
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await grants.list({
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/v3/grants',
          overrides: {
            apiUri: 'https://test.api.nylas.com',
            headers: { override: 'bar' },
          },
        })
      );
    });

    it('should call apiClient.request even without overrides set', async () => {
      await grants.list();

      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/v3/grants',
        })
      );
    });

    it('should properly pass queryParams when provided in the first parameter', async () => {
      await grants.list({
        queryParams: {
          limit: 10,
          offset: 5,
          provider: 'google',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/v3/grants',
          queryParams: {
            limit: 10,
            offset: 5,
            provider: 'google',
          },
        })
      );
    });

    it('should properly pass both queryParams and overrides when provided', async () => {
      await grants.list({
        queryParams: {
          limit: 20,
          provider: 'microsoft',
        },
        overrides: {
          apiUri: 'https://custom.api.nylas.com',
          headers: { custom: 'header' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/v3/grants',
          queryParams: {
            limit: 20,
            provider: 'microsoft',
          },
          overrides: {
            apiUri: 'https://custom.api.nylas.com',
            headers: { custom: 'header' },
          },
        })
      );
    });

    it('should support the deprecated _queryParams parameter', async () => {
      await grants.list({}, {
        limit: 15,
        provider: 'imap',
      } as any);

      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/v3/grants',
          queryParams: {
            limit: 15,
            provider: 'imap',
          },
        })
      );
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await grants.find({
        grantId: 'grant123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params', async () => {
      await grants.update({
        grantId: 'grant123',
        requestBody: {
          settings: {
            test_setting: 'abc123',
          },
          scope: ['calendar'],
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/v3/grants/grant123',
        body: {
          settings: {
            test_setting: 'abc123',
          },
          scope: ['calendar'],
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
      await grants.destroy({
        grantId: 'grant123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/grant123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });
});
