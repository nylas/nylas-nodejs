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

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await availability.list({
        queryParams: {
          startTime: '1659367800',
          endTime: '1659369600',
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
          startTime: '1659367800',
          endTime: '1659369600',
          configurationId: 'configuration123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });
    });
  });
});
