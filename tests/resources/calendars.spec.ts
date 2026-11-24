import APIClient from '../../src/apiClient';
import { Calendars } from '../../src/resources/calendars';
import {
  AvailabilityMethod,
  SpecificTimeAvailability,
} from '../../src/models/availability';
import {
  CalendarNotetaker,
  UpdateCalenderRequest,
} from '../../src/models/calendars';
import { objKeysToCamelCase, objKeysToSnakeCase } from '../../src/utils';
jest.mock('../../src/apiClient');

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

    it('should URL encode identifier and calendarId in find', async () => {
      await calendars.find({
        identifier: 'id 123',
        calendarId: 'calendar/123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/calendars/calendar%2F123',
        })
      );
    });

    it('should not double encode already-encoded identifier and calendarId in find', async () => {
      await calendars.find({
        identifier: 'id%20123',
        calendarId: 'calendar%2F123',
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/calendars/calendar%2F123',
        })
      );
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

    it('should send notetakerSettings with nested event selection rules', async () => {
      const requestBody: UpdateCalenderRequest = {
        notetaker: {
          notetakerSettings: {
            name: 'Calendar Notetaker',
            recordingType: 'audio',
            transcription: true,
            summary: true,
            actionItems: true,
          },
          deduplicationPolicy: 'disable',
          rules: {
            eventSelection: ['internal', ['own_events', 'external']],
            participantFilter: { participantsGte: 2 },
          },
        },
      };

      await calendars.update({
        identifier: 'id123',
        calendarId: 'calendar123',
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          path: '/v3/grants/id123/calendars/calendar123',
          body: requestBody,
        })
      );
      expect(
        objKeysToSnakeCase(requestBody as Record<string, unknown>, ['metadata'])
      ).toEqual({
        notetaker: {
          notetaker_settings: {
            name: 'Calendar Notetaker',
            recording_type: 'audio',
            transcription: true,
            summary: true,
            action_items: true,
          },
          deduplication_policy: 'disable',
          rules: {
            event_selection: ['internal', ['own_events', 'external']],
            participant_filter: { participants_gte: 2 },
          },
        },
      });
    });

    it('should accept configId and autocreate modes', () => {
      const fromConfig: CalendarNotetaker = { configId: 'config-123' };
      const autocreate: CalendarNotetaker = {
        autocreate: true,
        rules: { eventSelection: ['all'] },
      };
      expect(fromConfig.configId).toBe('config-123');
      expect(autocreate.autocreate).toBe(true);
    });

    it('should only accept event selection values the API accepts', () => {
      const rules: CalendarNotetaker['rules'] = {
        // @ts-expect-error The API takes own_events; values are not case-converted.
        eventSelection: ['ownEvents'],
      };
      expect(rules).toBeDefined();
    });

    it('should camelCase notetakerSettings in calendar responses', () => {
      const notetaker = objKeysToCamelCase({
        notetaker_settings: {
          name: 'Calendar Notetaker',
          recording_type: 'audio_video',
        },
        rules: { event_selection: ['participant_only'] },
      }) as CalendarNotetaker;

      expect(notetaker.notetakerSettings?.recordingType).toBe('audio_video');
      expect(notetaker.rules?.eventSelection).toEqual(['participant_only']);
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

    it('should call apiClient.request with tentativeAsBusy parameter', async () => {
      await calendars.getAvailability({
        requestBody: {
          startTime: 123,
          endTime: 456,
          participants: [],
          durationMinutes: 30,
          intervalMinutes: 15,
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
            tentativeAsBusy: false, // Don't treat tentative events as busy
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
            tentativeAsBusy: false, // Don't treat tentative events as busy
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

  describe('getAvailability with specificTimeAvailability', () => {
    it('should pass specificTimeAvailability on participants to the API', async () => {
      const specificTimeAvailability: SpecificTimeAvailability[] = [
        {
          date: '2025-08-21',
          start: '09:00',
          end: '13:00',
          timezone: 'America/Toronto',
        },
        {
          date: '2025-08-22',
          start: '10:00',
          end: '16:00',
        },
      ];

      await calendars.getAvailability({
        requestBody: {
          startTime: 123,
          endTime: 456,
          durationMinutes: 30,
          participants: [
            {
              email: 'test@example.com',
              openHours: [
                {
                  days: [1, 2, 3, 4, 5],
                  timezone: 'America/Toronto',
                  start: '09:00',
                  end: '17:00',
                  exdates: [],
                },
              ],
              specificTimeAvailability,
            },
          ],
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
          durationMinutes: 30,
          participants: [
            {
              email: 'test@example.com',
              openHours: [
                {
                  days: [1, 2, 3, 4, 5],
                  timezone: 'America/Toronto',
                  start: '09:00',
                  end: '17:00',
                  exdates: [],
                },
              ],
              specificTimeAvailability,
            },
          ],
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('getFreeBusy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await calendars.getFreeBusy({
        identifier: 'id123',
        requestBody: {
          startTime: 1609459200,
          endTime: 1609545600,
          emails: ['test@example.com', 'test2@example.com'],
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/calendars/free-busy',
        body: {
          startTime: 1609459200,
          endTime: 1609545600,
          emails: ['test@example.com', 'test2@example.com'],
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should call apiClient.request with tentativeAsBusy set to false', async () => {
      await calendars.getFreeBusy({
        identifier: 'id123',
        requestBody: {
          startTime: 1609459200,
          endTime: 1609545600,
          emails: ['test@example.com'],
          tentativeAsBusy: false,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/calendars/free-busy',
        body: {
          startTime: 1609459200,
          endTime: 1609545600,
          emails: ['test@example.com'],
          tentativeAsBusy: false,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should call apiClient.request with tentativeAsBusy set to true', async () => {
      await calendars.getFreeBusy({
        identifier: 'id123',
        requestBody: {
          startTime: 1609459200,
          endTime: 1609545600,
          emails: ['test@example.com'],
          tentativeAsBusy: true,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/calendars/free-busy',
        body: {
          startTime: 1609459200,
          endTime: 1609545600,
          emails: ['test@example.com'],
          tentativeAsBusy: true,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should handle multiple emails with tentativeAsBusy option', async () => {
      await calendars.getFreeBusy({
        identifier: 'grant-123',
        requestBody: {
          startTime: 1609459200,
          endTime: 1609545600,
          emails: [
            'user1@example.com',
            'user2@example.com',
            'user3@example.com',
          ],
          tentativeAsBusy: false,
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/grant-123/calendars/free-busy',
        body: {
          startTime: 1609459200,
          endTime: 1609545600,
          emails: [
            'user1@example.com',
            'user2@example.com',
            'user3@example.com',
          ],
          tentativeAsBusy: false,
        },
      });
    });
  });
});
