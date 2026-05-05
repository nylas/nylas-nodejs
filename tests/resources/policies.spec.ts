import APIClient from '../../src/apiClient';
import { Policies } from '../../src/resources/policies';

jest.mock('../../src/apiClient');

describe('Policies', () => {
  let apiClient: jest.Mocked<APIClient>;
  let policies: Policies;

  beforeEach(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    policies = new Policies(apiClient);
    apiClient.request.mockResolvedValue({ data: [] });
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await policies.list({
        queryParams: {
          limit: 10,
        },
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/policies',
        queryParams: {
          limit: 10,
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
      await policies.find({
        policyId: 'policy123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/policies/policy123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      const requestBody = {
        name: 'Standard Agent Account Policy',
        limits: {
          limitAttachmentSizeLimit: 26214400,
          limitAttachmentCountLimit: 50,
          limitInboxRetentionPeriod: 365,
          limitSpamRetentionPeriod: 30,
        },
        spamDetection: {
          useListDnsbl: true,
          useHeaderAnomalyDetection: true,
          spamSensitivity: 1.5,
        },
      };

      await policies.create({
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/policies',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params', async () => {
      const requestBody = {
        rules: ['rule123'],
      };

      await policies.update({
        policyId: 'policy123',
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/policies/policy123',
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
      await policies.destroy({
        policyId: 'policy123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/policies/policy123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });
});
