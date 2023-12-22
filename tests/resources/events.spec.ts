import APIClient from '../../src/apiClient';
import { Events } from '../../src/resources/events';
jest.mock('../src/apiClient');

describe('Events', () => {
  let apiClient: jest.Mocked<APIClient>;
  let events: Events;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
    }) as jest.Mocked<APIClient>;

    events = new Events(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await events.list({
        identifier: 'id123',
        queryParams: {
          calendarId: 'calendar123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/events',
        queryParams: {
          calendarId: 'calendar123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });

    it('should paginate correctly if a nextCursor is present', async () => {
      apiClient.request.mockResolvedValueOnce({
        requestId: 'request123',
        data: [
          {
            id: 'id',
            name: 'name',
          },
        ],
        nextCursor: 'cursor123',
      });
      const eventList = await events.list({
        identifier: 'id123',
        queryParams: {
          calendarId: 'calendar123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
      apiClient.request.mockResolvedValueOnce({
        requestId: 'request123',
        data: [
          {
            id: 'id',
            name: 'name',
          },
        ],
      });
      await eventList.next();

      expect(apiClient.request).toBeCalledTimes(2);
      expect(apiClient.request).toHaveBeenLastCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/events',
        queryParams: {
          calendarId: 'calendar123',
          pageToken: 'cursor123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });

    it('should not paginate if nextCursor is not present', async () => {
      apiClient.request.mockResolvedValueOnce({
        requestId: 'request123',
        data: [
          {
            id: 'id',
            name: 'name',
          },
        ],
      });
      const eventList = await events.list({
        identifier: 'id123',
        queryParams: {
          calendarId: 'calendar123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
      apiClient.request.mockResolvedValueOnce({
        requestId: 'request123',
        data: [
          {
            id: 'id',
            name: 'name',
          },
        ],
      });
      await eventList.next();

      expect(apiClient.request).toBeCalledTimes(1);
    });

    //TODO::More iterator tests
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await events.find({
        identifier: 'id123',
        eventId: 'event123',
        queryParams: {
          calendarId: 'calendar123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/events/event123',
        queryParams: {
          calendarId: 'calendar123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      await events.create({
        identifier: 'id123',
        requestBody: {
          when: {
            time: 123,
            timezone: 'America/Toronto',
          },
        },
        queryParams: {
          calendarId: 'calendar123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/events',
        body: {
          when: {
            time: 123,
            timezone: 'America/Toronto',
          },
        },
        queryParams: {
          calendarId: 'calendar123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params', async () => {
      await events.update({
        identifier: 'id123',
        eventId: 'event123',
        requestBody: {
          when: {
            time: 123,
            timezone: 'America/Toronto',
          },
        },
        queryParams: {
          calendarId: 'calendar123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/grants/id123/events/event123',
        body: {
          when: {
            time: 123,
            timezone: 'America/Toronto',
          },
        },
        queryParams: {
          calendarId: 'calendar123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await events.destroy({
        identifier: 'id123',
        eventId: 'event123',
        queryParams: {
          calendarId: 'calendar123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/events/event123',
        queryParams: {
          calendarId: 'calendar123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });
  });

  describe('send-rsvp', () => {
    it('should call apiClient.request with the correct params', async () => {
      await events.sendRsvp({
        identifier: 'id123',
        eventId: 'event123',
        queryParams: {
          calendarId: 'calendar123',
        },
        requestBody: {
          status: 'yes',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/events/event123/send-rsvp',
        queryParams: {
          calendarId: 'calendar123',
        },
        body: {
          status: 'yes',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
        },
      });
    });
  });
});
