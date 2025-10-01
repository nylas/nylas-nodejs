import { vi, describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
import APIClient from '../../src/apiClient';
import { Events } from '../../src/resources/events';
vi.mock('../../src/apiClient');

describe('Events', () => {
  let apiClient: any;
  let events: Events;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as any;

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
          headers: { override: 'bar' },
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
          headers: { override: 'bar' },
        },
      });
    });

    it('should call apiClient.request with tentativeAsBusy parameter', async () => {
      await events.list({
        identifier: 'id123',
        queryParams: {
          calendarId: 'calendar123',
          tentativeAsBusy: false, // Don't treat tentative events as busy
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/events',
        queryParams: {
          calendarId: 'calendar123',
          tentativeAsBusy: false, // Don't treat tentative events as busy
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
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
          headers: { override: 'bar' },
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
          headers: { override: 'bar' },
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
          headers: { override: 'bar' },
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

  describe('listImportEvents', () => {
    it('should call apiClient.request with the correct params', async () => {
      await events.listImportEvents({
        identifier: 'id123',
        queryParams: {
          calendarId: 'calendar123',
          start: 1617235200,
          end: 1619827200,
          limit: 100,
          select: 'id,name',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/events/import',
        queryParams: {
          calendarId: 'calendar123',
          start: 1617235200,
          end: 1619827200,
          limit: 100,
          select: 'id,name',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should paginate correctly with page_token for import events', async () => {
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
      const eventList = await events.listImportEvents({
        identifier: 'id123',
        queryParams: {
          calendarId: 'calendar123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
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
        path: '/v3/grants/id123/events/import',
        queryParams: {
          calendarId: 'calendar123',
          pageToken: 'cursor123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
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
          headers: { override: 'bar' },
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
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode identifier and eventId in find', async () => {
      await events.find({
        identifier: 'id 123',
        eventId: 'event/123',
        queryParams: { calendarId: 'calendar123' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/events/event%2F123',
        })
      );
    });

    it('should not double encode already-encoded identifier and eventId in find', async () => {
      await events.find({
        identifier: 'id%20123',
        eventId: 'event%2F123',
        queryParams: { calendarId: 'calendar123' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/events/event%2F123',
        })
      );
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
          headers: { override: 'bar' },
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
          headers: { override: 'bar' },
        },
      });
    });

    it('should call apiClient.request with notetaker settings', async () => {
      await events.create({
        identifier: 'id123',
        requestBody: {
          when: {
            time: 123,
            timezone: 'America/Toronto',
          },
          notetaker: {
            name: 'Custom Notetaker',
            meetingSettings: {
              videoRecording: true,
              audioRecording: true,
              transcription: true,
            },
          },
        },
        queryParams: {
          calendarId: 'calendar123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
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
          notetaker: {
            name: 'Custom Notetaker',
            meetingSettings: {
              videoRecording: true,
              audioRecording: true,
              transcription: true,
            },
          },
        },
        queryParams: {
          calendarId: 'calendar123',
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
          headers: { override: 'bar' },
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
          headers: { override: 'bar' },
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
          headers: { override: 'bar' },
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
          headers: { override: 'bar' },
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
          headers: { override: 'bar' },
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
          headers: { override: 'bar' },
        },
      });
    });
  });
});
