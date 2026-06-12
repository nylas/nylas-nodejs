import APIClient from '../../src/apiClient';
import { ServiceAccountSigner } from '../../src/models/serviceAccount';
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

const expectedSignedOverrides = (headers: Record<string, string> = {}) => ({
  ...signedOverrides(headers),
  skipAuth: true,
});

const signingHeaders = {
  'X-Nylas-Kid': 'signed-kid',
  'X-Nylas-Timestamp': '1742932766',
  'X-Nylas-Nonce': 'nonce-1234567890123456',
  'X-Nylas-Signature': 'generated-signature',
};

const signer = {
  buildHeaders: jest.fn(),
} as unknown as jest.Mocked<ServiceAccountSigner>;

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
    signer.buildHeaders.mockReset();
    signer.buildHeaders.mockReturnValue({ headers: signingHeaders });
  });

  it('should reject ordinary API-key-only requests', () => {
    expect(() => domains.find({ domainId: 'domain123' })).toThrow(
      'Manage Domains API requests require Nylas Service Account signing headers.'
    );
    expect(apiClient.request).not.toHaveBeenCalled();
  });

  it('should reject requests when a required signing header is blank', () => {
    expect(() =>
      domains.find({
        domainId: 'domain123',
        overrides: signedOverrides({ 'X-Nylas-Signature': ' ' }),
      })
    ).toThrow(
      'Manage Domains API requests require Nylas Service Account signing headers.'
    );
    expect(apiClient.request).not.toHaveBeenCalled();
  });

  it('should accept signing headers case-insensitively', async () => {
    await domains.find({
      domainId: 'domain123',
      overrides: {
        skipAuth: true,
        headers: {
          'x-nylas-kid': 'service-account-key-id',
          'x-nylas-timestamp': '1742932766',
          'x-nylas-nonce': 'nonce-1234567890123456',
          'x-nylas-signature': 'signed-request',
        },
      },
    });

    expect(apiClient.request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/v3/admin/domains/domain123',
      queryParams: undefined,
      overrides: {
        skipAuth: true,
        headers: {
          'x-nylas-kid': 'service-account-key-id',
          'x-nylas-timestamp': '1742932766',
          'x-nylas-nonce': 'nonce-1234567890123456',
          'x-nylas-signature': 'signed-request',
        },
      },
    });
  });

  it('should sign list requests with a service account signer', async () => {
    await domains.list({ signer });

    expect(signer.buildHeaders).toHaveBeenCalledWith({
      method: 'GET',
      path: '/v3/admin/domains',
      body: undefined,
    });
    expect(apiClient.request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/v3/admin/domains',
      queryParams: undefined,
      overrides: {
        skipAuth: true,
        headers: signingHeaders,
      },
    });
  });

  it('should generate fresh signer headers for paginated list requests', async () => {
    const firstHeaders = {
      ...signingHeaders,
      'X-Nylas-Nonce': 'first-nonce',
      'X-Nylas-Signature': 'first-signature',
    };
    const secondHeaders = {
      ...signingHeaders,
      'X-Nylas-Nonce': 'second-nonce',
      'X-Nylas-Signature': 'second-signature',
    };
    signer.buildHeaders
      .mockReturnValueOnce({ headers: firstHeaders })
      .mockReturnValueOnce({ headers: secondHeaders });
    apiClient.request
      .mockResolvedValueOnce({
        data: [{ id: 'domain-1' }],
        nextCursor: 'cursor-2',
      })
      .mockResolvedValueOnce({
        data: [],
      });

    await domains.list({
      queryParams: {
        limit: 2,
      },
      signer,
    });

    expect(signer.buildHeaders).toHaveBeenCalledTimes(2);
    expect(apiClient.request).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      path: '/v3/admin/domains',
      queryParams: {
        limit: 2,
      },
      overrides: {
        skipAuth: true,
        headers: firstHeaders,
      },
    });
    expect(apiClient.request).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      path: '/v3/admin/domains',
      queryParams: {
        limit: 1,
        pageToken: 'cursor-2',
      },
      overrides: {
        skipAuth: true,
        headers: secondHeaders,
      },
    });
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await domains.list({
        queryParams: {
          limit: 10,
        },
        overrides: signedOverrides({ override: 'bar' }),
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/admin/domains',
        queryParams: {
          limit: 10,
        },
        overrides: expectedSignedOverrides({ override: 'bar' }),
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
        queryParams: undefined,
        overrides: expectedSignedOverrides({ override: 'bar' }),
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
        queryParams: undefined,
        overrides: expectedSignedOverrides(),
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
        queryParams: undefined,
        body: requestBody,
        serializedBody:
          '{"domain_address":"mail.example.com","name":"Example mail domain"}',
        overrides: expectedSignedOverrides({ override: 'bar' }),
      });
    });

    it('should sign create requests and send the canonical body', async () => {
      const requestBody = {
        name: 'Example mail domain',
        domainAddress: 'mail.example.com',
      };
      signer.buildHeaders.mockReturnValue({
        headers: signingHeaders,
        serializedBody:
          '{"domain_address":"mail.example.com","name":"Example mail domain"}',
      });

      await domains.create({
        requestBody,
        signer,
        overrides: { headers: { 'X-Custom': 'value' } },
      });

      expect(signer.buildHeaders).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/admin/domains',
        body: {
          name: 'Example mail domain',
          domain_address: 'mail.example.com',
        },
      });
      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/admin/domains',
        queryParams: undefined,
        body: requestBody,
        serializedBody:
          '{"domain_address":"mail.example.com","name":"Example mail domain"}',
        overrides: {
          skipAuth: true,
          headers: {
            'X-Custom': 'value',
            ...signingHeaders,
          },
        },
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
        queryParams: undefined,
        body: requestBody,
        serializedBody: '{"name":"Renamed domain"}',
        overrides: expectedSignedOverrides({ override: 'bar' }),
      });
    });

    it('should sign update requests with the exact PUT path and canonical body', async () => {
      const requestBody = {
        name: 'Renamed domain',
      };
      signer.buildHeaders.mockReturnValue({
        headers: signingHeaders,
        serializedBody: '{"name":"Renamed domain"}',
      });

      await domains.update({
        domainId: 'domain123',
        requestBody,
        signer,
      });

      expect(signer.buildHeaders).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/admin/domains/domain123',
        body: {
          name: 'Renamed domain',
        },
      });
      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/admin/domains/domain123',
        queryParams: undefined,
        body: requestBody,
        serializedBody: '{"name":"Renamed domain"}',
        overrides: {
          skipAuth: true,
          headers: signingHeaders,
        },
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
        overrides: expectedSignedOverrides({ override: 'bar' }),
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
        queryParams: undefined,
        body: requestBody,
        serializedBody: '{"type":"ownership"}',
        overrides: expectedSignedOverrides({ override: 'bar' }),
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
        queryParams: undefined,
        body: requestBody,
        serializedBody: '{"options":{"key_length":2048},"type":"dkim"}',
        overrides: expectedSignedOverrides(),
      });
    });

    it('should sign info requests with a canonical snake_case body', async () => {
      const requestBody = {
        type: 'dkim' as const,
        options: { keyLength: 2048 },
      };
      signer.buildHeaders.mockReturnValue({
        headers: signingHeaders,
        serializedBody: '{"options":{"key_length":2048},"type":"dkim"}',
      });

      await domains.info({
        domainId: 'domain123',
        requestBody,
        signer,
      });

      expect(signer.buildHeaders).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/admin/domains/domain123/info',
        body: {
          type: 'dkim',
          options: { key_length: 2048 },
        },
      });
      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/admin/domains/domain123/info',
        queryParams: undefined,
        body: requestBody,
        serializedBody: '{"options":{"key_length":2048},"type":"dkim"}',
        overrides: {
          skipAuth: true,
          headers: signingHeaders,
        },
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
        queryParams: undefined,
        body: requestBody,
        serializedBody: '{"type":"spf"}',
        overrides: expectedSignedOverrides({ override: 'bar' }),
      });
    });
  });
});
