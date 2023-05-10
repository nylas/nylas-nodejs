import APIClient from '../src/apiClient';
import { Calendars } from '../src/resources/calendars';
import {
  CalendarListResponseSchema,
  CalendarResponseSchema,
} from '../src/schema/calendars';
import { DeleteResponseSchema } from '../src/schema/response';
jest.mock('../src/apiClient');

describe('Events', () => {
  let apiClient: jest.Mocked<APIClient>;
  let calendars: Calendars;

  beforeAll(() => {
    apiClient = new APIClient({
      clientId: 'clientId',
      clientSecret: 'clientSecret',
      apiKey: 'apiKey',
    }) as jest.Mocked<APIClient>;

    calendars = new Calendars(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await calendars.list({
        identifier: 'id123',
        overrides: {
          serverUrl: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith(
        {
          method: 'GET',
          path: '/v3/grants/id123/calendars',
          overrides: {
            serverUrl: 'https://test.api.nylas.com',
          },
        },
        {
          responseSchema: CalendarListResponseSchema,
        }
      );
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
      const eventList = await calendars.list({
        identifier: 'id123',
        overrides: {
          serverUrl: 'https://test.api.nylas.com',
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
      expect(apiClient.request).toHaveBeenLastCalledWith(
        {
          method: 'GET',
          path: '/v3/grants/id123/calendars',
          queryParams: {
            pageToken: 'cursor123',
          },
          overrides: {
            serverUrl: 'https://test.api.nylas.com',
          },
        },
        {
          responseSchema: CalendarListResponseSchema,
        }
      );
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
      const calendarList = await calendars.list({
        identifier: 'id123',
        overrides: {
          serverUrl: 'https://test.api.nylas.com',
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
      await calendarList.next();

      expect(apiClient.request).toBeCalledTimes(1);
    });

    //TODO::More iterator tests
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await calendars.find({
        identifier: 'id123',
        calendarId: 'calendar123',
        overrides: {
          serverUrl: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith(
        {
          method: 'GET',
          path: '/v3/grants/id123/calendars/calendar123',
          overrides: {
            serverUrl: 'https://test.api.nylas.com',
          },
        },
        {
          responseSchema: CalendarResponseSchema,
        }
      );
    });
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      await calendars.create({
        identifier: 'id123',
        requestBody: {
          name: 'name',
        },
        overrides: {
          serverUrl: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith(
        {
          method: 'POST',
          path: '/v3/grants/id123/calendars',
          body: {
            name: 'name',
          },
          overrides: {
            serverUrl: 'https://test.api.nylas.com',
          },
        },
        {
          responseSchema: CalendarResponseSchema,
        }
      );
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params', async () => {
      await calendars.update({
        identifier: 'id123',
        calendarId: 'calendar123',
        requestBody: {
          name: 'name2',
        },
        overrides: {
          serverUrl: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith(
        {
          method: 'PUT',
          path: '/v3/grants/id123/calendars/calendar123',
          body: {
            name: 'name2',
          },
          overrides: {
            serverUrl: 'https://test.api.nylas.com',
          },
        },
        {
          responseSchema: CalendarResponseSchema,
        }
      );
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await calendars.destroy({
        identifier: 'id123',
        calendarId: 'calendar123',
        overrides: {
          serverUrl: 'https://test.api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith(
        {
          method: 'DELETE',
          path: '/v3/grants/id123/calendars/calendar123',
          overrides: {
            serverUrl: 'https://test.api.nylas.com',
          },
        },
        {
          responseSchema: DeleteResponseSchema,
        }
      );
    });
  });
});
