import {
  describe,
  it,
  expect,
  _beforeEach,
  _beforeAll,
  _afterEach,
  _afterAll,
  vi,
} from 'vitest';
import APIClient from '../../src/apiClient';
import { Webhooks } from '../../src/resources/webhooks';
import { WebhookTriggers } from '../../src/models/webhooks';

vi.mock('../../src/apiClient');

describe('Webhooks', () => {
  let apiClient: any;
  let webhooks: Webhooks;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as any;

    webhooks = new Webhooks(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await webhooks.list();

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/webhooks',
      });
    });

    it('should call apiClient.request with overrides', async () => {
      await webhooks.list({
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/webhooks',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await webhooks.find({
        webhookId: 'webhook123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/webhooks/webhook123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode webhookId in find', async () => {
      await webhooks.find({
        webhookId: 'webhook/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/webhooks/webhook%2F123',
        })
      );
    });

    it('should not double encode already-encoded webhookId in find', async () => {
      await webhooks.find({
        webhookId: 'webhook%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/webhooks/webhook%2F123',
        })
      );
    });
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      await webhooks.create({
        requestBody: {
          triggerTypes: [WebhookTriggers.CalendarCreated],
          webhookUrl: 'https://test.callback.com',
          description: "My Webhook's Description",
          notificationEmailAddresses: ['notification@example.com'],
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/webhooks',
        body: {
          triggerTypes: [WebhookTriggers.CalendarCreated],
          webhookUrl: 'https://test.callback.com',
          description: "My Webhook's Description",
          notificationEmailAddresses: ['notification@example.com'],
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
      await webhooks.update({
        webhookId: 'webhook123',
        requestBody: {
          description: "Updated Calendar's Description",
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/webhooks/webhook123',
        body: {
          description: "Updated Calendar's Description",
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode webhookId in update', async () => {
      await webhooks.update({
        webhookId: 'webhook/123',
        requestBody: { description: 'desc' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/webhooks/webhook%2F123',
        })
      );
    });

    it('should not double encode already-encoded webhookId in update', async () => {
      await webhooks.update({
        webhookId: 'webhook%2F123',
        requestBody: { description: 'desc' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/webhooks/webhook%2F123',
        })
      );
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await webhooks.destroy({
        webhookId: 'webhook123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/webhooks/webhook123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode webhookId in destroy', async () => {
      await webhooks.destroy({
        webhookId: 'webhook/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/webhooks/webhook%2F123',
        })
      );
    });

    it('should not double encode already-encoded webhookId in destroy', async () => {
      await webhooks.destroy({
        webhookId: 'webhook%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/webhooks/webhook%2F123',
        })
      );
    });
  });

  describe('rotateSecret', () => {
    it('should call apiClient.request with the correct params', async () => {
      await webhooks.rotateSecret({
        webhookId: 'webhook123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/webhooks/rotate-secret/webhook123',
        body: {},
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode webhookId in rotateSecret', async () => {
      await webhooks.rotateSecret({
        webhookId: 'webhook/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/webhooks/rotate-secret/webhook%2F123',
        })
      );
    });

    it('should not double encode already-encoded webhookId in rotateSecret', async () => {
      await webhooks.rotateSecret({
        webhookId: 'webhook%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/webhooks/rotate-secret/webhook%2F123',
        })
      );
    });
  });

  describe('ipAddresses', () => {
    it('should call apiClient.request with the correct params', async () => {
      await webhooks.ipAddresses();

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/webhooks/ip-addresses',
        body: undefined,
      });
    });

    it('should call apiClient.request with overrides', async () => {
      await webhooks.ipAddresses({
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/webhooks/ip-addresses',
        body: undefined,
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('extractChallengeParameter', () => {
    it('should extract the challenge parameter from a valid URL', () => {
      const url = 'https://example.com?challenge=testValue';
      const result = webhooks.extractChallengeParameter(url);
      expect(result).toBe('testValue');
    });

    it('should throw an error if the challenge parameter is missing', () => {
      const url = 'https://example.com?otherParam=value';
      expect(() => webhooks.extractChallengeParameter(url)).toThrow(
        'Invalid URL or no challenge parameter found.'
      );
    });

    it('should throw an error for an invalid URL', () => {
      const url = 'not-a-valid-url';
      expect(() => webhooks.extractChallengeParameter(url)).toThrow();
    });
  });
});
