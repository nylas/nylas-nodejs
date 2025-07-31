import APIClient from '../../src/apiClient';
import { Sessions } from '../../src/resources/sessions';
jest.mock('../../src/apiClient');

describe('Sessions', () => {
  let apiClient: jest.Mocked<APIClient>;
  let sessions: Sessions;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    sessions = new Sessions(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      await sessions.create({
        requestBody: {
          configurationId: 'configuration123',
          timeToLive: 30,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/scheduling/sessions',
        body: {
          configurationId: 'configuration123',
          timeToLive: 30,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await sessions.destroy({
        sessionId: 'session123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/scheduling/sessions/session123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });
    });

    it('should URL encode sessionId in destroy', async () => {
      await sessions.destroy({
        sessionId: 'session/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/scheduling/sessions/session%2F123',
        })
      );
    });

    it('should not double encode already-encoded sessionId in destroy', async () => {
      await sessions.destroy({
        sessionId: 'session%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/scheduling/sessions/session%2F123',
        })
      );
    });
  });
});
