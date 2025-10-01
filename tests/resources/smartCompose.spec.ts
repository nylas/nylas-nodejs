import APIClient from '../../src/apiClient';
import { SmartCompose } from '../../src/resources/smartCompose';
vi.mock('../../src/apiClient');

import { describe, it, expect, beforeEach, beforeAll, afterEach, afterAll, vi } from 'vitest';

describe('SmartCompose', () => {
  let apiClient: any;
  let smartCompose: SmartCompose;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as any;

    smartCompose = new SmartCompose(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('composeMessage', () => {
    it('should call apiClient.request with the correct params', async () => {
      await smartCompose.composeMessage({
        identifier: 'id123',
        requestBody: {
          prompt: 'This is an example prompt',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/messages/smart-compose',
        body: {
          prompt: 'This is an example prompt',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode identifier in composeMessage', async () => {
      await smartCompose.composeMessage({
        identifier: 'id 123',
        requestBody: { prompt: 'Prompt' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/messages/smart-compose',
        })
      );
    });

    it('should not double encode already-encoded identifier in composeMessage', async () => {
      await smartCompose.composeMessage({
        identifier: 'id%20123',
        requestBody: { prompt: 'Prompt' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/messages/smart-compose',
        })
      );
    });
  });

  describe('composeMessageReply', () => {
    it('should call apiClient.request with the correct params', async () => {
      await smartCompose.composeMessageReply({
        identifier: 'id123',
        messageId: 'message123',
        requestBody: {
          prompt: 'This is an example prompt',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/messages/message123/smart-compose',
        body: {
          prompt: 'This is an example prompt',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode identifier and messageId in composeMessageReply', async () => {
      await smartCompose.composeMessageReply({
        identifier: 'id 123',
        messageId: 'message/123',
        requestBody: { prompt: 'Prompt' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/messages/message%2F123/smart-compose',
        })
      );
    });

    it('should not double encode already-encoded identifier and messageId in composeMessageReply', async () => {
      await smartCompose.composeMessageReply({
        identifier: 'id%20123',
        messageId: 'message%2F123',
        requestBody: { prompt: 'Prompt' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/messages/message%2F123/smart-compose',
        })
      );
    });
  });
});
