import APIClient from '../../src/apiClient';
import { Notetakers } from '../../src/resources/notetakers';
jest.mock('../../src/apiClient');

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

    it('should find a notetaker without identifier', async () => {
      await notetakers.find({
        notetakerId: 'notetaker123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/notetakers/notetaker123',
      });
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
  });

  describe('cancel', () => {
    it('should cancel a notetaker by ID', async () => {
      await notetakers.cancel({
        identifier: 'id123',
        notetakerId: 'notetaker123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/notetakers/notetaker123',
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
        path: '/v3/grants/id123/notetakers/notetaker123',
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
        path: '/v3/notetakers/notetaker123',
      });
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
  });
});
