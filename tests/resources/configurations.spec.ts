import { describe, it, expect, beforeAll, vi } from 'vitest';
import APIClient from '../../src/apiClient';
import { Configurations } from '../../src/resources/configurations';

vi.mock('../../src/apiClient');

describe('Configurations', () => {
  let apiClient: any;
  let configurations: Configurations;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as any;

    configurations = new Configurations(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with correct params', async () => {
      await configurations.list({
        identifier: 'grant123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant123/scheduling/configurations',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with correct params', async () => {
      await configurations.find({
        identifier: 'grant123',
        configurationId: 'configuration123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant123/scheduling/configurations/configuration123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });
    });

    it('should URL encode identifier and configurationId in find', async () => {
      await configurations.find({
        identifier: 'grant 123',
        configurationId: 'configuration/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/grant%20123/scheduling/configurations/configuration%2F123',
        })
      );
    });

    it('should not double encode already-encoded identifier and configurationId in find', async () => {
      await configurations.find({
        identifier: 'grant%20123',
        configurationId: 'configuration%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/grant%20123/scheduling/configurations/configuration%2F123',
        })
      );
    });
  });

  describe('create', () => {
    it('should call apiClient.request with correct params', async () => {
      await configurations.create({
        identifier: 'grant123',
        requestBody: {
          requiresSessionAuth: false,
          participants: [
            {
              name: 'Test',
              email: 'nylassdk@nylas.com',
              availability: {
                calendarIds: ['primary'],
              },
              booking: {
                calendarId: 'primary',
              },
            },
          ],
          availability: {
            durationMinutes: 30,
          },
          eventBooking: {
            title: 'My test event',
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/grant123/scheduling/configurations',
        body: {
          requiresSessionAuth: false,
          participants: [
            {
              name: 'Test',
              email: 'nylassdk@nylas.com',
              availability: {
                calendarIds: ['primary'],
              },
              booking: {
                calendarId: 'primary',
              },
            },
          ],
          availability: {
            durationMinutes: 30,
          },
          eventBooking: {
            title: 'My test event',
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params', async () => {
      await configurations.update({
        identifier: 'grant123',
        configurationId: 'configuration123',
        requestBody: {
          eventBooking: {
            title: 'Changed Title',
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/grants/grant123/scheduling/configurations/configuration123',
        body: {
          eventBooking: {
            title: 'Changed Title',
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });
    });

    it('should URL encode identifier and configurationId in update', async () => {
      await configurations.update({
        identifier: 'grant 123',
        configurationId: 'configuration/123',
        requestBody: { eventBooking: { title: 'Changed Title' } },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/grant%20123/scheduling/configurations/configuration%2F123',
        })
      );
    });

    it('should not double encode already-encoded identifier and configurationId in update', async () => {
      await configurations.update({
        identifier: 'grant%20123',
        configurationId: 'configuration%2F123',
        requestBody: { eventBooking: { title: 'Changed Title' } },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/grant%20123/scheduling/configurations/configuration%2F123',
        })
      );
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await configurations.destroy({
        identifier: 'grant123',
        configurationId: 'configuration123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/grant123/scheduling/configurations/configuration123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });
    });

    it('should URL encode identifier and configurationId in destroy', async () => {
      await configurations.destroy({
        identifier: 'grant 123',
        configurationId: 'configuration/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/grant%20123/scheduling/configurations/configuration%2F123',
        })
      );
    });

    it('should not double encode already-encoded identifier and configurationId in destroy', async () => {
      await configurations.destroy({
        identifier: 'grant%20123',
        configurationId: 'configuration%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/grant%20123/scheduling/configurations/configuration%2F123',
        })
      );
    });
  });
});
