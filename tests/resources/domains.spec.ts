import APIClient from '../../src/apiClient';
import { Domains } from '../../src/resources/domains';

jest.mock('../../src/apiClient');

const serviceAccountHeaders = {
  'X-Nylas-Kid': 'service-account-key-id',
  'X-Nylas-Timestamp': '1742932766',
  'X-Nylas-Nonce': 'nonce-1234567890123456',
  'X-Nylas-Signature': 'signed-request',
};

const signedOverrides = (headers: Record<string, string> = {}) => ({
  apiUri: 'https://override.api.nylas.com',
  headers: { ...serviceAccountHeaders, ...headers },
});

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

  it('should reject ordinary API-key-only requests', () => {
    expect(() => domains.find({ domainId: 'domain123' })).toThrow(
      'Manage Domains API requests require Nylas Service Account signing headers.'
    );
    expect(apiClient.request).not.toHaveBeenCalled();
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await domains.list({
        queryParams: {
          limit: 10,
          domain: 'mail.example.com',
          region: 'us',
        },
        overrides: signedOverrides({ override: 'bar' }),
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
        overrides: signedOverrides({ override: 'bar' }),
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await domains.find({
        domainId: 'domain123',
        overrides: signedOverrides({ override: 'bar' }),
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/admin/domains/domain123',
        overrides: signedOverrides({ override: 'bar' }),
      });
    });

    it('should accept a domain address as the identifier', async () => {
      await domains.find({
        domainId: 'mail.example.com',
        overrides: signedOverrides(),
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/admin/domains/mail.example.com',
        overrides: signedOverrides(),
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
        overrides: signedOverrides({ override: 'bar' }),
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/admin/domains',
        body: requestBody,
        overrides: signedOverrides({ override: 'bar' }),
      });
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params using PUT', async () => {
      const requestBody = {
        name: 'Renamed domain',
      };

      await domains.update({
        domainId: 'domain123',
        requestBody,
        overrides: signedOverrides({ override: 'bar' }),
      });

      // Update is PUT (not PATCH) and targets the admin surface.
      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/admin/domains/domain123',
        body: requestBody,
        overrides: signedOverrides({ override: 'bar' }),
      });
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await domains.destroy({
        domainId: 'domain123',
        overrides: signedOverrides({ override: 'bar' }),
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/admin/domains/domain123',
        overrides: signedOverrides({ override: 'bar' }),
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
        overrides: signedOverrides({ override: 'bar' }),
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/admin/domains/domain123/info',
        body: requestBody,
        overrides: signedOverrides({ override: 'bar' }),
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
        overrides: signedOverrides(),
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/admin/domains/domain123/info',
        body: requestBody,
        overrides: signedOverrides(),
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
        overrides: signedOverrides({ override: 'bar' }),
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/admin/domains/domain123/verify',
        body: requestBody,
        overrides: signedOverrides({ override: 'bar' }),
      });
    });

    it('should accept the extended dmarc/arc verification types', async () => {
      const requestBody = {
        type: 'arc' as const,
      };

      await domains.verify({
        domainId: 'mail.example.com',
        requestBody,
        overrides: signedOverrides(),
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/admin/domains/mail.example.com/verify',
        body: requestBody,
        overrides: signedOverrides(),
      });
    });
  });
});
