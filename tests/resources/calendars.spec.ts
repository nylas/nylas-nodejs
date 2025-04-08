import APIClient from '../../src/apiClient';
import { Calendars } from '../../src/resources/calendars';
import { AvailabilityMethod } from '../../src/models/availability';
jest.mock('../src/apiClient');

describe('Calendars', () => {
  let apiClient: jest.Mocked<APIClient>;
  let calendars: Calendars;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    calendars = new Calendars(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await calendars.list({
        identifier: 'id123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/calendars',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await calendars.find({
        identifier: 'id123',
        calendarId: 'calendar123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/calendars/calendar123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      await calendars.create({
        identifier: 'id123',
        requestBody: {
          name: 'My Calendar',
          description: "My Calendar's Description",
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/calendars',
        body: {
          name: 'My Calendar',
          description: "My Calendar's Description",
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should call apiClient.request with notetaker settings', async () => {
      await calendars.create({
        identifier: 'id123',
        requestBody: {
          name: 'My Calendar',
          description: "My Calendar's Description",
          notetaker: {
            name: 'Custom Notetaker',
            meetingSettings: {
              videoRecording: true,
              audioRecording: true,
              transcription: true,
            },
            rules: {
              eventSelection: ['internal', 'external'],
              participantFilter: {
                participantsGte: 3,
                participantsLte: 10,
              },
            },
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/calendars',
        body: {
          name: 'My Calendar',
          description: "My Calendar's Description",
          notetaker: {
            name: 'Custom Notetaker',
            meetingSettings: {
              videoRecording: true,
              audioRecording: true,
              transcription: true,
            },
            rules: {
              eventSelection: ['internal', 'external'],
              participantFilter: {
                participantsGte: 3,
                participantsLte: 10,
              },
            },
          },
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
      await calendars.update({
        identifier: 'id123',
        calendarId: 'calendar123',
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
        path: '/v3/grants/id123/calendars/calendar123',
        body: {
          description: "Updated Calendar's Description",
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should call apiClient.request with updated notetaker settings', async () => {
      await calendars.update({
        identifier: 'id123',
        calendarId: 'calendar123',
        requestBody: {
          notetaker: {
            name: 'Updated Notetaker',
            meetingSettings: {
              videoRecording: false,
              audioRecording: true,
              transcription: false,
            },
            rules: {
              eventSelection: ['all'],
              participantFilter: {
                participantsGte: 5,
              },
            },
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/grants/id123/calendars/calendar123',
        body: {
          notetaker: {
            name: 'Updated Notetaker',
            meetingSettings: {
              videoRecording: false,
              audioRecording: true,
              transcription: false,
            },
            rules: {
              eventSelection: ['all'],
              participantFilter: {
                participantsGte: 5,
              },
            },
          },
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
      await calendars.destroy({
        identifier: 'id123',
        calendarId: 'calendar123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/calendars/calendar123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('getAvailability', () => {
    it('should call apiClient.request with the correct params', async () => {
      await calendars.getAvailability({
        requestBody: {
          startTime: 123,
          endTime: 456,
          participants: [],
          durationMinutes: 30,
          intervalMinutes: 15,
          roundTo30Minutes: true,
          availabilityRules: {
            availabilityMethod: AvailabilityMethod.MaxAvailability,
            buffer: {
              before: 15,
              after: 15,
            },
            defaultOpenHours: [
              {
                days: [0],
                timezone: 'America/Toronto',
                start: '09:00',
                end: '17:00',
                exdates: ['2020-01-01'],
              },
            ],
            roundRobinEventId: 'event123',
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/calendars/availability',
        body: {
          startTime: 123,
          endTime: 456,
          participants: [],
          durationMinutes: 30,
          intervalMinutes: 15,
          roundTo30Minutes: true,
          availabilityRules: {
            availabilityMethod: AvailabilityMethod.MaxAvailability,
            buffer: {
              before: 15,
              after: 15,
            },
            defaultOpenHours: [
              {
                days: [0],
                timezone: 'America/Toronto',
                start: '09:00',
                end: '17:00',
                exdates: ['2020-01-01'],
              },
            ],
            roundRobinEventId: 'event123',
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('getCollectiveAvailability', () => {
    it('should call apiClient.request with the correct params', async () => {
      await calendars.getAvailability({
        requestBody: {
          startTime: 123,
          endTime: 456,
          participants: [],
          durationMinutes: 30,
          intervalMinutes: 15,
          roundTo30Minutes: true,
          availabilityRules: {
            availabilityMethod: AvailabilityMethod.Collective,
            buffer: {
              before: 15,
              after: 15,
            },
            defaultOpenHours: [
              {
                days: [0],
                timezone: 'America/Toronto',
                start: '09:00',
                end: '17:00',
                exdates: ['2020-01-01'],
              },
            ],
            roundRobinEventId: 'event123',
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/calendars/availability',
        body: {
          startTime: 123,
          endTime: 456,
          participants: [],
          durationMinutes: 30,
          intervalMinutes: 15,
          roundTo30Minutes: true,
          availabilityRules: {
            availabilityMethod: AvailabilityMethod.Collective,
            buffer: {
              before: 15,
              after: 15,
            },
            defaultOpenHours: [
              {
                days: [0],
                timezone: 'America/Toronto',
                start: '09:00',
                end: '17:00',
                exdates: ['2020-01-01'],
              },
            ],
            roundRobinEventId: 'event123',
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });
});
