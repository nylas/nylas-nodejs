import APIClient from '../../src/apiClient';
import { Domains } from '../../src/resources/domains';

jest.mock('../../src/apiClient');

describe('Domains', () => {
  let apiClient: jest.Mocked<APIClient>;
  let domains: Domains;

  beforeEach(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    domains = new Domains(apiClient);
    apiClient.request.mockResolvedValue({ data: [] });
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await domains.list({
        queryParams: {
          limit: 10,
          domain: 'mail.example.com',
          region: 'us',
        },
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      // Path must target the public admin surface, and the address filter key
      // is `domain` (not `domainAddress`).
      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/admin/domains',
        queryParams: {
          limit: 10,
          domain: 'mail.example.com',
          region: 'us',
        },
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await domains.find({
        domainId: 'domain123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/admin/domains/domain123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should accept a domain address as the identifier', async () => {
      await domains.find({
        domainId: 'mail.example.com',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/admin/domains/mail.example.com',
        overrides: undefined,
      });
    });
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      const requestBody = {
        name: 'Example mail domain',
        domainAddress: 'mail.example.com',
      };

      await domains.create({
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/admin/domains',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params using PUT', async () => {
      const requestBody = {
        name: 'Renamed domain',
        verifiedFeedback: true,
      };

      await domains.update({
        domainId: 'domain123',
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      // Update is PUT (not PATCH) and targets the admin surface.
      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/admin/domains/domain123',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await domains.destroy({
        domainId: 'domain123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/admin/domains/domain123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('info', () => {
    it('should POST to the /info subpath with the verification attempt body', async () => {
      const requestBody = {
        type: 'ownership' as const,
      };

      await domains.info({
        domainId: 'domain123',
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/admin/domains/domain123/info',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should accept options on the verification attempt', async () => {
      const requestBody = {
        type: 'dkim' as const,
        options: { keyLength: 2048 },
      };

      await domains.info({
        domainId: 'domain123',
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/admin/domains/domain123/info',
        body: requestBody,
        overrides: undefined,
      });
    });
  });

  describe('verify', () => {
    it('should POST to the /verify subpath with the verification attempt body', async () => {
      const requestBody = {
        type: 'spf' as const,
      };

      await domains.verify({
        domainId: 'domain123',
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/admin/domains/domain123/verify',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should accept the extended dmarc/arc verification types', async () => {
      const requestBody = {
        type: 'arc' as const,
      };

      await domains.verify({
        domainId: 'mail.example.com',
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/admin/domains/mail.example.com/verify',
        body: requestBody,
        overrides: undefined,
      });
    });
  });
});
