import APIClient from '../../src/apiClient';
import { Notetakers } from '../../src/resources/notetakers';
import {
  CreateNotetakerRequest,
  Notetaker,
  UpdateNotetakerRequest,
} from '../../src/models/notetakers';
import { objKeysToCamelCase, objKeysToSnakeCase } from '../../src/utils';
jest.mock('../../src/apiClient');

// Mirrors how APIClient serializes JSON request bodies.
const toWireFormat = (body: object): Record<string, unknown> =>
  objKeysToSnakeCase(body as Record<string, unknown>, ['metadata']);

describe('Notetakers', () => {
  let apiClient: jest.Mocked<APIClient>;
  let notetakers: Notetakers;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    notetakers = new Notetakers(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await notetakers.list({
        identifier: 'id123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/notetakers',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should call apiClient.request without identifier', async () => {
      await notetakers.list({});

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/notetakers',
      });
    });

    it('should support filtering by state', async () => {
      await notetakers.list({
        queryParams: {
          state: 'attending',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/notetakers',
        queryParams: {
          state: 'attending',
        },
      });
    });

    it('should support filtering by join time range', async () => {
      await notetakers.list({
        queryParams: {
          joinTimeStart: 1683936000,
          joinTimeEnd: 1684022400,
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/notetakers',
        queryParams: {
          joinTimeStart: 1683936000,
          joinTimeEnd: 1684022400,
        },
      });
    });

    it('should support pagination parameters', async () => {
      apiClient.request.mockResolvedValueOnce({
        data: [],
        requestId: 'test-request-id',
        nextCursor: 'next_cursor',
        prevCursor: 'prev_cursor',
      });

      await notetakers.list({
        queryParams: {
          limit: 10,
          pageToken: 'next_page_token',
          prevPageToken: 'prev_page_token',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/notetakers',
        queryParams: {
          limit: 10,
          pageToken: 'next_page_token',
          prevPageToken: 'prev_page_token',
        },
      });
    });

    it('should support combining multiple query parameters', async () => {
      apiClient.request.mockResolvedValueOnce({
        data: [],
        requestId: 'test-request-id',
        nextCursor: 'next_cursor',
      });

      await notetakers.list({
        identifier: 'id123',
        queryParams: {
          state: 'media_processing',
          joinTimeStart: 1683936000,
          limit: 25,
          pageToken: 'next_page_token',
          orderBy: 'name',
          orderDirection: 'desc',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/notetakers',
        queryParams: {
          state: 'media_processing',
          joinTimeStart: 1683936000,
          limit: 25,
          pageToken: 'next_page_token',
          orderBy: 'name',
          orderDirection: 'desc',
        },
      });
    });

    it('should support ordering by name', async () => {
      await notetakers.list({
        queryParams: {
          orderBy: 'name',
          orderDirection: 'asc',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/notetakers',
        queryParams: {
          orderBy: 'name',
          orderDirection: 'asc',
        },
      });
    });

    it('should use default order direction when not specified', async () => {
      await notetakers.list({
        queryParams: {
          orderBy: 'name',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/notetakers',
        queryParams: {
          orderBy: 'name',
        },
      });
    });

    it('should use default order by when only direction specified', async () => {
      await notetakers.list({
        queryParams: {
          orderDirection: 'desc',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/notetakers',
        queryParams: {
          orderDirection: 'desc',
        },
      });
    });

    it('should support ordering by join_time', async () => {
      await notetakers.list({
        queryParams: {
          orderBy: 'join_time',
          orderDirection: 'asc',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/notetakers',
        queryParams: {
          orderBy: 'join_time',
          orderDirection: 'asc',
        },
      });
    });

    it('should support ordering by created_at', async () => {
      await notetakers.list({
        queryParams: {
          orderBy: 'created_at',
          orderDirection: 'desc',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/notetakers',
        queryParams: {
          orderBy: 'created_at',
          orderDirection: 'desc',
        },
      });
    });

    it('should support combining ordering with other filters', async () => {
      await notetakers.list({
        queryParams: {
          state: 'attending',
          joinTimeStart: 1683936000,
          orderBy: 'name',
          orderDirection: 'desc',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/notetakers',
        queryParams: {
          state: 'attending',
          joinTimeStart: 1683936000,
          orderBy: 'name',
          orderDirection: 'desc',
        },
      });
    });
  });

  describe('create', () => {
    it('should create a notetaker with all properties', async () => {
      const requestBody = {
        meetingLink: 'https://meet.google.com/abc-def-ghi',
        joinTime: 1234567890,
        name: 'Custom Notetaker',
        meetingSettings: {
          videoRecording: true,
          audioRecording: true,
          transcription: true,
        },
      };

      await notetakers.create({
        identifier: 'id123',
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/notetakers',
        body: requestBody,
      });
    });

    it('should create a notetaker with notetakerSettings', async () => {
      const requestBody: CreateNotetakerRequest = {
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        notetakerSettings: {
          name: 'Nylas Notetaker',
          recordingType: 'audio',
          transcription: true,
          transcriptionSettings: {
            expectedLanguages: ['en', 'es'],
            fallbackLanguage: 'en',
            keywords: ['Nylas'],
            useSpeakerNamesAsKeywords: true,
          },
          summary: true,
          summarySettings: { customInstructions: 'Use bullet points.' },
          actionItems: true,
          actionItemsSettings: { customInstructions: 'Top 5 only.' },
          leaveAfterSilenceSeconds: 600,
          leaveDetectionDelaySeconds: 30,
          messages: {
            onJoin: [{ type: 'text', content: 'Hello', sendAfterMs: 1000 }],
            onParticipantJoin: [
              { type: 'text', content: 'Welcome', debounceMs: 5000 },
            ],
          },
          videoOutput: { mediaType: 'image/png', data: 'aGVsbG8=' },
          retentionTime: 604800,
        },
      };

      await notetakers.create({
        identifier: 'id123',
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/notetakers',
        body: requestBody,
      });
      expect(toWireFormat(requestBody)).toEqual({
        meeting_link: 'https://meet.google.com/abc-defg-hij',
        notetaker_settings: {
          name: 'Nylas Notetaker',
          recording_type: 'audio',
          transcription: true,
          transcription_settings: {
            expected_languages: ['en', 'es'],
            fallback_language: 'en',
            keywords: ['Nylas'],
            use_speaker_names_as_keywords: true,
          },
          summary: true,
          summary_settings: { custom_instructions: 'Use bullet points.' },
          action_items: true,
          action_items_settings: { custom_instructions: 'Top 5 only.' },
          leave_after_silence_seconds: 600,
          leave_detection_delay_seconds: 30,
          messages: {
            on_join: [{ type: 'text', content: 'Hello', send_after_ms: 1000 }],
            on_participant_join: [
              { type: 'text', content: 'Welcome', debounce_ms: 5000 },
            ],
          },
          video_output: { media_type: 'image/png', data: 'aGVsbG8=' },
          retention_time: 604800,
        },
      });
    });

    it('should create a notetaker from a configuration', async () => {
      const requestBody: CreateNotetakerRequest = {
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        configId: 'config123',
      };

      await notetakers.create({ requestBody });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/notetakers',
        body: requestBody,
      });
      expect(toWireFormat(requestBody)).toEqual({
        meeting_link: 'https://meet.google.com/abc-defg-hij',
        config_id: 'config123',
      });
    });

    it('should type video output uploads separately from stored metadata', () => {
      const disable: CreateNotetakerRequest = {
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        notetakerSettings: { videoOutput: {} },
      };
      const missingMediaType: CreateNotetakerRequest = {
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        // @ts-expect-error data requires mediaType
        notetakerSettings: { videoOutput: { data: 'aGVsbG8=' } },
      };
      const responseMetadata: CreateNotetakerRequest = {
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        notetakerSettings: {
          // @ts-expect-error stored image metadata is read-only
          videoOutput: { mediaType: 'image/png', size: 1024 },
        },
      };

      expect(toWireFormat(disable)).toEqual({
        meeting_link: 'https://meet.google.com/abc-defg-hij',
        notetaker_settings: { video_output: {} },
      });
      expect(missingMediaType).toBeDefined();
      expect(responseMetadata).toBeDefined();
    });

    it('should keep a null transcriptionSettings when serializing', () => {
      const requestBody: CreateNotetakerRequest = {
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        notetakerSettings: { transcriptionSettings: null },
      };

      expect(toWireFormat(requestBody)).toEqual({
        meeting_link: 'https://meet.google.com/abc-defg-hij',
        notetaker_settings: { transcription_settings: null },
      });
    });

    it('should create a notetaker without identifier', async () => {
      const requestBody = {
        meetingLink: 'https://meet.google.com/abc-def-ghi',
      };

      await notetakers.create({
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/notetakers',
        body: requestBody,
      });
    });

    it('should create a notetaker with only required properties', async () => {
      const requestBody = {
        meetingLink: 'https://meet.google.com/abc-def-ghi',
      };

      await notetakers.create({
        identifier: 'id123',
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/notetakers',
        body: requestBody,
      });
    });

    it('should create a notetaker with partial meeting settings', async () => {
      const requestBody = {
        meetingLink: 'https://meet.google.com/abc-def-ghi',
        meetingSettings: {
          videoRecording: false,
          audioRecording: true,
        },
      };

      await notetakers.create({
        identifier: 'id123',
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/notetakers',
        body: requestBody,
      });
    });
  });

  describe('response', () => {
    it('should camelCase notetaker_settings in a notetaker response', () => {
      const notetaker = objKeysToCamelCase({
        id: 'notetaker123',
        join_time: 1234567890,
        meeting_link: 'https://meet.google.com/abc-defg-hij',
        meeting_provider: 'Google Meet',
        state: 'scheduled',
        notetaker_settings: {
          name: 'Nylas Notetaker',
          recording_type: 'audio',
          transcription: true,
          action_items: true,
          messages: { on_join: null, on_participant_join: null },
          video_output: {
            media_type: 'image/png',
            size: 1024,
            preview_url: 'https://example.com/preview.png',
            preview_url_expires_at: 1234567890,
          },
        },
      }) as Notetaker;

      expect(notetaker.name).toBeUndefined();
      expect(notetaker.meetingSettings).toBeUndefined();
      expect(notetaker.notetakerSettings).toEqual({
        name: 'Nylas Notetaker',
        recordingType: 'audio',
        transcription: true,
        actionItems: true,
        messages: { onJoin: null, onParticipantJoin: null },
        videoOutput: {
          mediaType: 'image/png',
          size: 1024,
          previewUrl: 'https://example.com/preview.png',
          previewUrlExpiresAt: 1234567890,
        },
      });
    });
  });

  describe('find', () => {
    it('should find a notetaker by ID', async () => {
      await notetakers.find({
        identifier: 'id123',
        notetakerId: 'notetaker123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/notetakers/notetaker123',
      });
    });

    it('should URL encode identifier and notetakerId in find', async () => {
      await notetakers.find({
        identifier: 'id 123',
        notetakerId: 'notetaker/123',
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/notetakers/notetaker%2F123',
        })
      );
    });

    it('should not double encode already-encoded identifier and notetakerId in find', async () => {
      await notetakers.find({
        identifier: 'id%20123',
        notetakerId: 'notetaker%2F123',
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/notetakers/notetaker%2F123',
        })
      );
    });

    it('should find a notetaker without identifier', async () => {
      await notetakers.find({
        notetakerId: 'notetaker123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/notetakers/notetaker123',
      });
    });

    it('should return calendarId and eventId when present in the response', async () => {
      const mockResponse = {
        requestId: 'req-123',
        data: {
          id: 'notetaker123',
          name: 'Nylas Notetaker',
          joinTime: 1744222418,
          meetingLink: 'https://meet.google.com/abc-def-ghi',
          meetingProvider: 'Google Meet',
          state: 'scheduled',
          calendarId: 'calendar123',
          eventId: 'event456',
          meetingSettings: {
            videoRecording: true,
            audioRecording: true,
            transcription: false,
          },
        },
      };

      apiClient.request.mockResolvedValueOnce(mockResponse);

      const response = await notetakers.find({
        identifier: 'id123',
        notetakerId: 'notetaker123',
      });

      expect(response.data.calendarId).toBe('calendar123');
      expect(response.data.eventId).toBe('event456');
    });
  });

  describe('update', () => {
    it('should update a notetaker', async () => {
      const requestBody = {
        joinTime: 1234567890,
        name: 'Updated Notetaker',
        meetingSettings: {
          videoRecording: false,
          audioRecording: true,
          transcription: true,
        },
      };

      await notetakers.update({
        identifier: 'id123',
        notetakerId: 'notetaker123',
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/v3/grants/id123/notetakers/notetaker123',
        body: requestBody,
      });
    });

    it('should update a notetaker with notetakerSettings', async () => {
      const requestBody: UpdateNotetakerRequest = {
        notetakerSettings: {
          recordingType: 'audio_video',
          summary: false,
        },
      };

      await notetakers.update({
        identifier: 'id123',
        notetakerId: 'notetaker123',
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/v3/grants/id123/notetakers/notetaker123',
        body: requestBody,
      });
      expect(toWireFormat(requestBody)).toEqual({
        notetaker_settings: { recording_type: 'audio_video', summary: false },
      });
    });

    it('should update a notetaker with partial data', async () => {
      const requestBody = {
        name: 'Updated Notetaker',
      };

      await notetakers.update({
        identifier: 'id123',
        notetakerId: 'notetaker123',
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/v3/grants/id123/notetakers/notetaker123',
        body: requestBody,
      });
    });

    it('should update a notetaker without identifier', async () => {
      const requestBody = {
        name: 'Updated Notetaker',
      };

      await notetakers.update({
        notetakerId: 'notetaker123',
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/v3/notetakers/notetaker123',
        body: requestBody,
      });
    });

    it('should URL encode identifier and notetakerId in update', async () => {
      await notetakers.update({
        identifier: 'id 123',
        notetakerId: 'notetaker/123',
        requestBody: { name: 'Updated Notetaker' },
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/notetakers/notetaker%2F123',
        })
      );
    });

    it('should not double encode already-encoded identifier and notetakerId in update', async () => {
      await notetakers.update({
        identifier: 'id%20123',
        notetakerId: 'notetaker%2F123',
        requestBody: { name: 'Updated Notetaker' },
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/notetakers/notetaker%2F123',
        })
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a notetaker by ID', async () => {
      await notetakers.cancel({
        identifier: 'id123',
        notetakerId: 'notetaker123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/notetakers/notetaker123/cancel',
      });
    });

    it('should cancel a notetaker with overrides', async () => {
      await notetakers.cancel({
        identifier: 'id123',
        notetakerId: 'notetaker123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/notetakers/notetaker123/cancel',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should cancel a notetaker without identifier', async () => {
      await notetakers.cancel({
        notetakerId: 'notetaker123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/notetakers/notetaker123/cancel',
      });
    });

    it('should URL encode identifier and notetakerId in cancel', async () => {
      await notetakers.cancel({
        identifier: 'id 123',
        notetakerId: 'notetaker/123',
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/notetakers/notetaker%2F123/cancel',
        })
      );
    });

    it('should not double encode already-encoded identifier and notetakerId in cancel', async () => {
      await notetakers.cancel({
        identifier: 'id%20123',
        notetakerId: 'notetaker%2F123',
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/notetakers/notetaker%2F123/cancel',
        })
      );
    });
  });

  describe('leave', () => {
    it('should remove a notetaker from a meeting', async () => {
      const mockResponse = {
        requestId: 'req-123',
        data: {
          id: 'notetaker123',
          message: 'Notetaker has left the meeting successfully',
        },
      };

      apiClient.request.mockResolvedValueOnce(mockResponse);

      const response = await notetakers.leave({
        identifier: 'id123',
        notetakerId: 'notetaker123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/notetakers/notetaker123/leave',
      });

      expect(response).toEqual(mockResponse);
      expect(response.data.id).toBe('notetaker123');
      expect(response.data.message).toBe(
        'Notetaker has left the meeting successfully'
      );
    });

    it('should remove a notetaker from a meeting with overrides', async () => {
      const mockResponse = {
        requestId: 'req-456',
        data: {
          id: 'notetaker123',
          message: 'Notetaker has left the meeting successfully',
        },
      };

      apiClient.request.mockResolvedValueOnce(mockResponse);

      const response = await notetakers.leave({
        identifier: 'id123',
        notetakerId: 'notetaker123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/notetakers/notetaker123/leave',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(response).toEqual(mockResponse);
    });

    it('should remove a notetaker from a meeting without identifier', async () => {
      const mockResponse = {
        requestId: 'req-789',
        data: {
          id: 'notetaker123',
          message: 'Notetaker has left the meeting successfully',
        },
      };

      apiClient.request.mockResolvedValueOnce(mockResponse);

      const response = await notetakers.leave({
        notetakerId: 'notetaker123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/notetakers/notetaker123/leave',
      });

      expect(response).toEqual(mockResponse);
    });

    it('should URL encode identifier and notetakerId in leave', async () => {
      await notetakers.leave({
        identifier: 'id 123',
        notetakerId: 'notetaker/123',
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/notetakers/notetaker%2F123/leave',
        })
      );
    });

    it('should not double encode already-encoded identifier and notetakerId in leave', async () => {
      await notetakers.leave({
        identifier: 'id%20123',
        notetakerId: 'notetaker%2F123',
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/notetakers/notetaker%2F123/leave',
        })
      );
    });
  });

  describe('downloadMedia', () => {
    it('should download media with identifier', async () => {
      const mockResponse = {
        requestId: 'req-123',
        data: {
          recording: {
            size: 21550491,
            name: 'meeting_recording.mp4',
            type: 'video/mp4',
            createdAt: 1744222418,
            expiresAt: 1744481618,
            url: 'url_for_recording',
            ttl: 259106,
          },
          transcript: {
            size: 862,
            name: 'raw_transcript.json',
            type: 'application/json',
            createdAt: 1744222418,
            expiresAt: 1744481618,
            url: 'url_for_transcript',
            ttl: 259106,
          },
        },
      };

      apiClient.request.mockResolvedValueOnce(mockResponse);

      const response = await notetakers.downloadMedia({
        identifier: 'id123',
        notetakerId: 'notetaker123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/notetakers/notetaker123/media',
      });

      expect(response).toEqual(mockResponse);

      expect(response.data.recording.size).toBe(21550491);
      expect(response.data.recording.name).toBe('meeting_recording.mp4');
      expect(response.data.recording.type).toBe('video/mp4');
      expect(response.data.recording.createdAt).toBe(1744222418);
      expect(response.data.recording.expiresAt).toBe(1744481618);
      expect(response.data.recording.url).toBe('url_for_recording');
      expect(response.data.recording.ttl).toBe(259106);

      expect(response.data.transcript.size).toBe(862);
      expect(response.data.transcript.name).toBe('raw_transcript.json');
      expect(response.data.transcript.type).toBe('application/json');
      expect(response.data.transcript.createdAt).toBe(1744222418);
      expect(response.data.transcript.expiresAt).toBe(1744481618);
      expect(response.data.transcript.url).toBe('url_for_transcript');
      expect(response.data.transcript.ttl).toBe(259106);
    });

    it('should download media without identifier', async () => {
      const mockResponse = {
        requestId: 'req-456',
        data: {
          recording: {
            size: 21550491,
            name: 'meeting_recording.mp4',
            type: 'video/mp4',
            createdAt: 1744222418,
            expiresAt: 1744481618,
            url: 'url_for_recording',
            ttl: 259106,
          },
          transcript: {
            size: 862,
            name: 'raw_transcript.json',
            type: 'application/json',
            createdAt: 1744222418,
            expiresAt: 1744481618,
            url: 'url_for_transcript',
            ttl: 259106,
          },
        },
      };

      apiClient.request.mockResolvedValueOnce(mockResponse);

      const response = await notetakers.downloadMedia({
        notetakerId: 'notetaker123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/notetakers/notetaker123/media',
      });

      expect(response).toEqual(mockResponse);
    });

    it('should URL encode identifier and notetakerId in downloadMedia', async () => {
      await notetakers.downloadMedia({
        identifier: 'id 123',
        notetakerId: 'notetaker/123',
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/notetakers/notetaker%2F123/media',
        })
      );
    });

    it('should not double encode already-encoded identifier and notetakerId in downloadMedia', async () => {
      await notetakers.downloadMedia({
        identifier: 'id%20123',
        notetakerId: 'notetaker%2F123',
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/notetakers/notetaker%2F123/media',
        })
      );
    });
  });
});
