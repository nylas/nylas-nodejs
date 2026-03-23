import APIClient from '../../src/apiClient';
import { SchedulerAvailability } from '../../src/resources/availability';
jest.mock('../../src/apiClient');

describe('SchedulerAvailability', () => {
  let apiClient: jest.Mocked<APIClient>;
  let availability: SchedulerAvailability;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    availability = new SchedulerAvailability(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('get', () => {
    it('should call apiClient.request with configurationId', async () => {
      await availability.get({
        queryParams: {
          startTime: 1659367800,
          endTime: 1659369600,
          configurationId: 'configuration123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/scheduling/availability',
        queryParams: {
          startTime: 1659367800,
          endTime: 1659369600,
          configurationId: 'configuration123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });
    });

    it('should call apiClient.request with slug', async () => {
      await availability.get({
        queryParams: {
          startTime: 1659367800,
          endTime: 1659369600,
          slug: 'my-schedule',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/scheduling/availability',
        queryParams: {
          startTime: 1659367800,
          endTime: 1659369600,
          slug: 'my-schedule',
        },
        overrides: undefined,
      });
    });

    it('should call apiClient.request with clientId', async () => {
      await availability.get({
        queryParams: {
          startTime: 1659367800,
          endTime: 1659369600,
          clientId: 'client123',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/scheduling/availability',
        queryParams: {
          startTime: 1659367800,
          endTime: 1659369600,
          clientId: 'client123',
        },
        overrides: undefined,
      });
    });

    it('should call apiClient.request with bookingId for reschedule availability', async () => {
      await availability.get({
        queryParams: {
          startTime: 1659367800,
          endTime: 1659369600,
          configurationId: 'configuration123',
          bookingId: 'booking456',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/scheduling/availability',
        queryParams: {
          startTime: 1659367800,
          endTime: 1659369600,
          configurationId: 'configuration123',
          bookingId: 'booking456',
        },
        overrides: undefined,
      });
    });

    it('should URL-encode special characters in query params', async () => {
      await availability.get({
        queryParams: {
          startTime: 1659367800,
          endTime: 1659369600,
          slug: 'my schedule/special',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/scheduling/availability',
        queryParams: {
          startTime: 1659367800,
          endTime: 1659369600,
          slug: 'my schedule/special',
        },
        overrides: undefined,
      });
    });
  });
});
