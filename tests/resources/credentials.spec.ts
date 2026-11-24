import APIClient from '../../src/apiClient';
import { CredentialType } from '../../src/models/credentials';
import { Credentials } from '../../src/resources/credentials';
import { objKeysToCamelCase } from '../../src/utils';
jest.mock('../../src/apiClient');

describe('Credentials', () => {
  let apiClient: jest.Mocked<APIClient>;
  let credentials: Credentials;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

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

    it('should return certificate fields for certificate credentials', async () => {
      // Shape of the API response after APIClient camelCases it.
      const apiResponse = objKeysToCamelCase({
        request_id: 'req-1',
        data: {
          id: 'cert-cred-id',
          name: 'Dashboard cert',
          credential_type: 'connectorcertificate',
          certificate_expires_at: 1798761600,
          thumbprint: 'A1B2C3D4E5F6',
          created_at: 1763900000,
          updated_at: 1763900000,
        },
      });
      apiClient.request.mockResolvedValueOnce(apiResponse);

      const { data } = await credentials.find({
        provider: 'microsoft',
        credentialsId: 'cert-cred-id',
      });

      expect(data.credentialType).toBe(CredentialType.CONNECTORCERTIFICATE);
      expect(data.certificateExpiresAt).toBe(1798761600);
      expect(data.thumbprint).toBe('A1B2C3D4E5F6');
    });

    it('should leave certificate fields undefined for other credential types', async () => {
      apiClient.request.mockResolvedValueOnce(
        objKeysToCamelCase({
          request_id: 'req-2',
          data: { id: 'sa-id', name: 'SA', credential_type: 'serviceaccount' },
        })
      );

      const { data } = await credentials.find({
        provider: 'google',
        credentialsId: 'sa-id',
      });

      expect(data.certificateExpiresAt).toBeUndefined();
      expect(data.thumbprint).toBeUndefined();
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
        method: 'PATCH',
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
