import APIClient from '../../src/apiClient';
import { SmartCompose } from '../../src/resources/smartCompose';
jest.mock('../src/apiClient');

describe('SmartCompose', () => {
  let apiClient: jest.Mocked<APIClient>;
  let smartCompose: SmartCompose;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

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
        },
      });
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
        },
      });
    });
  });
});
