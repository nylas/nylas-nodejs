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
import { CredentialType } from '../../src/models/credentials';
import { Credentials } from '../../src/resources/credentials';

vi.mock('../../src/apiClient');

describe('Credentials', () => {
  let apiClient: any;
  let credentials: Credentials;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as any;

    credentials = new Credentials(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await credentials.list({
        provider: 'microsoft',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/connectors/microsoft/creds',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await credentials.find({
        provider: 'microsoft',
        credentialsId: 'microsoft-id123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/connectors/microsoft/creds/microsoft-id123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode provider and credentialsId in find', async () => {
      await credentials.find({
        provider: 'microsoft',
        credentialsId: 'id/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/connectors/microsoft/creds/id%2F123',
        })
      );
    });

    it('should not double encode already-encoded provider and credentialsId in find', async () => {
      await credentials.find({
        provider: 'microsoft',
        credentialsId: 'id%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/connectors/microsoft/creds/id%2F123',
        })
      );
    });

    it('should URL encode credentialsId in find', async () => {
      await credentials.find({
        provider: 'microsoft',
        credentialsId: 'id/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/connectors/microsoft/creds/id%2F123',
        })
      );
    });

    it('should not double encode already-encoded credentialsId in find', async () => {
      await credentials.find({
        provider: 'microsoft',
        credentialsId: 'id%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/connectors/microsoft/creds/id%2F123',
        })
      );
    });
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      await credentials.create({
        provider: 'microsoft',
        requestBody: {
          name: 'My Microsoft Connector',
          credentialType: CredentialType.CONNECTOR,
          credentialData: {
            clientID: '<CLIENT_ID>',
            clientSecret: '<CLIENT_SECRET>',
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/connectors/microsoft/creds',
        body: {
          name: 'My Microsoft Connector',
          credentialType: CredentialType.CONNECTOR,
          credentialData: {
            clientID: '<CLIENT_ID>',
            clientSecret: '<CLIENT_SECRET>',
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
      await credentials.update({
        provider: 'microsoft',
        credentialsId: 'microsoft-123',
        requestBody: {
          name: 'Changed Name',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/connectors/microsoft/creds/microsoft-123',
        body: {
          name: 'Changed Name',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode credentialsId in update', async () => {
      await credentials.update({
        provider: 'microsoft',
        credentialsId: 'id/123',
        requestBody: { name: 'Changed Name' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/connectors/microsoft/creds/id%2F123',
        })
      );
    });

    it('should not double encode already-encoded credentialsId in update', async () => {
      await credentials.update({
        provider: 'microsoft',
        credentialsId: 'id%2F123',
        requestBody: { name: 'Changed Name' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/connectors/microsoft/creds/id%2F123',
        })
      );
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await credentials.destroy({
        provider: 'microsoft',
        credentialsId: 'microsoft-1234',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/connectors/microsoft/creds/microsoft-1234',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode credentialsId in destroy', async () => {
      await credentials.destroy({
        provider: 'microsoft',
        credentialsId: 'id/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/connectors/microsoft/creds/id%2F123',
        })
      );
    });

    it('should not double encode already-encoded credentialsId in destroy', async () => {
      await credentials.destroy({
        provider: 'microsoft',
        credentialsId: 'id%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/connectors/microsoft/creds/id%2F123',
        })
      );
    });
  });
});
