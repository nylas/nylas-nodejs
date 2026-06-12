import APIClient from '../../src/apiClient';
import { Applications } from '../../src/resources/applications';
jest.mock('../../src/apiClient');

describe('Applications', () => {
  let apiClient: jest.Mocked<APIClient>;
  let applications: Applications;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    applications = new Applications(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('getDetails', () => {
    it('should call apiClient.request with the correct params', async () => {
      await applications.getDetails({
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/applications',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should call apiClient.request even without overrides set', async () => {
      await applications.getDetails();

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/applications',
      });
    });
  });

  describe('update', () => {
    it('should PATCH /v3/applications with the supplied body', async () => {
      // Update is a PATCH (not PUT) per the v3 applications spec; each nested
      // object is a full replace.
      await applications.update({
        requestBody: {
          branding: {
            name: 'My App',
            iconUrl: 'https://example.com/icon.png',
          },
          hostedAuthentication: {
            alignment: 'center',
            termsOfServiceUrl: 'https://example.com/tos',
            privacyPolicyUrl: 'https://example.com/privacy',
          },
          idpSettings: {
            origins: 'https://example.com',
            issuers: 'https://issuer.example.com',
          },
          callbackUris: [
            {
              id: '0556d035-6cb6-4262-a035-6b77e11cf8fc',
              url: 'https://example.com/callback',
              platform: 'web',
            },
          ],
          domain: 'auth.example.com',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/v3/applications',
        body: {
          branding: {
            name: 'My App',
            iconUrl: 'https://example.com/icon.png',
          },
          hostedAuthentication: {
            alignment: 'center',
            termsOfServiceUrl: 'https://example.com/tos',
            privacyPolicyUrl: 'https://example.com/privacy',
          },
          idpSettings: {
            origins: 'https://example.com',
            issuers: 'https://issuer.example.com',
          },
          callbackUris: [
            {
              id: '0556d035-6cb6-4262-a035-6b77e11cf8fc',
              url: 'https://example.com/callback',
              platform: 'web',
            },
          ],
          domain: 'auth.example.com',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should send additionalSettings in the request body when supplied', async () => {
      // Per the v3 applications spec (discrepancy #13), additional_settings IS
      // updatable via PATCH /v3/applications: the handler parses and persists it,
      // and only strips it from the response. The SDK must therefore forward it in
      // the request body even though it is never echoed back on the application model.
      await applications.update({
        requestBody: {
          additionalSettings: {
            loginUrl: 'https://example.com/login',
            logoutUrl: 'https://example.com/logout',
            refreshTokenExpirationAbsolute: 86400,
            refreshTokenExpirationIdle: 3600,
            rotateRefreshToken: true,
            allowQueryParamInRedirectUri: false,
          },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/v3/applications',
        body: {
          additionalSettings: {
            loginUrl: 'https://example.com/login',
            logoutUrl: 'https://example.com/logout',
            refreshTokenExpirationAbsolute: 86400,
            refreshTokenExpirationIdle: 3600,
            rotateRefreshToken: true,
            allowQueryParamInRedirectUri: false,
          },
        },
      });
    });
  });

  describe('constructor', () => {
    it('should initialize the redirect-uri resource', () => {
      expect(applications.redirectUris.constructor.name).toBe('RedirectUris');
    });
  });
});
