import APIClient from '../../src/apiClient';
import { Grants } from '../../src/resources/grants';
jest.mock('../src/apiClient');

describe('Grants', () => {
  let apiClient: jest.Mocked<APIClient>;
  let grants: Grants;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    grants = new Grants(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await grants.list({
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });

    it('should call apiClient.request even without overrides set', async () => {
      await grants.list();

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants',
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await grants.find({
        grantId: 'grant123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
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
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/grant123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });
  });
});
