import APIClient from '../../src/apiClient';
import { Rules } from '../../src/resources/rules';

jest.mock('../../src/apiClient');

describe('Rules', () => {
  let apiClient: jest.Mocked<APIClient>;
  let rules: Rules;

  beforeEach(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    rules = new Rules(apiClient);
    apiClient.request.mockResolvedValue({ data: [] });
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await rules.list({
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
        path: '/v3/rules',
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
      await rules.find({
        ruleId: 'rule123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/rules/rule123',
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
        name: 'Block spam domains',
        priority: 1,
        trigger: 'inbound' as const,
        match: {
          operator: 'any' as const,
          conditions: [
            {
              field: 'from.domain' as const,
              operator: 'is' as const,
              value: 'spam-domain.com',
            },
          ],
        },
        actions: [{ type: 'block' as const }],
      };

      await rules.create({
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/rules',
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
        enabled: false,
      };

      await rules.update({
        ruleId: 'rule123',
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/rules/rule123',
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
      await rules.destroy({
        ruleId: 'rule123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/rules/rule123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('listEvaluations', () => {
    it('should call apiClient.request with the correct params', async () => {
      await rules.listEvaluations({
        identifier: 'grant123',
        queryParams: {
          limit: 50,
        },
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant123/rule-evaluations',
        queryParams: {
          limit: 50,
        },
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });
});
