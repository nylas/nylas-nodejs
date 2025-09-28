import APIClient from '../../src/apiClient';
import { Events } from '../../src/resources/events';
jest.mock('../../src/apiClient');

describe('Events', () => {
  let apiClient: jest.Mocked<APIClient>;
  let events: Events;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
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

  describe('URL encoding issues (GitHub issue #673)', () => {
    it('should properly encode query parameters without double encoding', async () => {
      // Test case that reproduces the issue described in GitHub issue #673
      // where query parameters might be double-encoded causing %3F instead of ?
      const queryParams = {
        calendarId: 'calendar@example.com',
        start: '1640995200',
        end: '1641081600',
        limit: 50,
        metadataPair: { 'custom-key': 'custom-value' },
      };

      // Mock the response to avoid the pagination logic
      apiClient.request.mockResolvedValueOnce({
        requestId: 'request123',
        data: [],
        nextCursor: null,
      });

      await events.list({
        identifier: 'grant-id',
        queryParams,
        overrides: {
          apiUri: 'https://api.nylas.com',
        },
      });

      // Verify that the request was made with properly encoded query parameters
      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant-id/events',
        queryParams,
        overrides: {
          apiUri: 'https://api.nylas.com',
        },
      });
    });

    it('should handle special characters in query parameters correctly', async () => {
      const queryParams = {
        calendarId: 'calendar+test@example.com',
        title: 'meeting with ? special chars',
        metadataPair: { 'key with spaces': 'value with & symbols' },
      };

      // Mock the response to avoid the pagination logic
      apiClient.request.mockResolvedValueOnce({
        requestId: 'request123',
        data: [],
        nextCursor: null,
      });

      await events.list({
        identifier: 'grant-id',
        queryParams,
        overrides: {
          apiUri: 'https://api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant-id/events',
        queryParams,
        overrides: {
          apiUri: 'https://api.nylas.com',
        },
      });
    });

    it('should not double-encode already encoded parameters', async () => {
      const queryParams = {
        calendarId: 'calendar%40example.com', // Already URL encoded
        title: 'meeting%20with%20special%20chars', // Already URL encoded
      };

      // Mock the response to avoid the pagination logic
      apiClient.request.mockResolvedValueOnce({
        requestId: 'request123',
        data: [],
        nextCursor: null,
      });

      await events.list({
        identifier: 'grant-id',
        queryParams,
        overrides: {
          apiUri: 'https://api.nylas.com',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant-id/events',
        queryParams,
        overrides: {
          apiUri: 'https://api.nylas.com',
        },
      });
    });
  });

  describe('URL construction and encoding (direct API client tests)', () => {
    it('should construct URLs with properly encoded query parameters', async () => {
      // Test the URL construction by creating a URL and manually calling setQueryStrings
      const baseUrl = new URL('https://api.nylas.com/v3/grants/grant-id/events');
      const queryParams = {
        calendarId: 'calendar@example.com',
        start: '1640995200',
        end: '1641081600',
        limit: 50,
        metadataPair: { 'custom-key': 'custom-value' },
      };

      // Create a real API client to test actual URL construction
      const realApiClient = new APIClient({
        apiKey: 'test-api-key',
        apiUri: 'https://api.nylas.com',
        timeout: 30,
        headers: {},
      });

      // Access the private method through bracket notation for testing
      const setQueryStrings = (realApiClient as any).setQueryStrings.bind(realApiClient);
      const finalUrl = setQueryStrings(baseUrl, queryParams);

      // Verify the actual URL that was constructed
      const requestUrl = finalUrl.toString();
      expect(requestUrl).toContain('?'); // Should have proper query separator
      expect(requestUrl).not.toContain('%3F'); // Should not have encoded question mark
      expect(requestUrl).toContain('calendar%40example.com'); // Email should be properly encoded
      expect(requestUrl).toContain('start=1640995200');
      expect(requestUrl).toContain('end=1641081600');
      expect(requestUrl).toContain('limit=50');
      expect(requestUrl).toContain('metadata_pair=custom-key%3Acustom-value'); // metadataPair should be properly formatted
    });

    it('should handle special characters in query parameters without double encoding', async () => {
      const baseUrl = new URL('https://api.nylas.com/v3/grants/grant-id/events');
      const queryParams = {
        calendarId: 'calendar+test@example.com',
        title: 'meeting with ? special chars',
        metadataPair: { 'key with spaces': 'value with & symbols' },
      };

      const realApiClient = new APIClient({
        apiKey: 'test-api-key',
        apiUri: 'https://api.nylas.com',
        timeout: 30,
        headers: {},
      });

      const setQueryStrings = (realApiClient as any).setQueryStrings.bind(realApiClient);
      const finalUrl = setQueryStrings(baseUrl, queryParams);
      const requestUrl = finalUrl.toString();
      
      // Verify proper encoding
      expect(requestUrl).toContain('?'); // Should have proper query separator
      expect(requestUrl).not.toContain('%3F'); // Should not have encoded question mark
      expect(requestUrl).toContain('calendar%2Btest%40example.com'); // + and @ should be properly encoded
      expect(requestUrl).toContain('title=meeting%20with%20%3F%20special%20chars'); // Space and ? should be encoded
      expect(requestUrl).toContain('metadata_pair=key%20with%20spaces%3Avalue%20with%20%26%20symbols'); // Complex metadata
    });

    it('should not double-encode already encoded parameters', async () => {
      const baseUrl = new URL('https://api.nylas.com/v3/grants/grant-id/events');
      const queryParams = {
        calendarId: 'calendar%40example.com', // Already URL encoded
        title: 'meeting%20with%20special%20chars', // Already URL encoded
      };

      const realApiClient = new APIClient({
        apiKey: 'test-api-key',
        apiUri: 'https://api.nylas.com',
        timeout: 30,
        headers: {},
      });

      const setQueryStrings = (realApiClient as any).setQueryStrings.bind(realApiClient);
      const finalUrl = setQueryStrings(baseUrl, queryParams);
      const requestUrl = finalUrl.toString();
      
      // Verify no double encoding occurred
      expect(requestUrl).toContain('?'); // Should have proper query separator
      expect(requestUrl).not.toContain('%3F'); // Should not have encoded question mark
      expect(requestUrl).toContain('calendar%40example.com'); // Should remain as provided (no double encoding)
      expect(requestUrl).toContain('title=meeting%20with%20special%20chars'); // Should remain as provided
    });

    it('should handle array parameters correctly', async () => {
      const baseUrl = new URL('https://api.nylas.com/v3/grants/grant-id/events');
      const queryParams = {
        calendarId: 'primary',
        attendees: ['user1@example.com', 'user2@example.com'],
        eventType: ['default' as const, 'outOfOffice' as const],
      };

      const realApiClient = new APIClient({
        apiKey: 'test-api-key',
        apiUri: 'https://api.nylas.com',
        timeout: 30,
        headers: {},
      });

      const setQueryStrings = (realApiClient as any).setQueryStrings.bind(realApiClient);
      const finalUrl = setQueryStrings(baseUrl, queryParams);
      const requestUrl = finalUrl.toString();
      
      // Verify array parameters are handled correctly
      expect(requestUrl).toContain('?'); // Should have proper query separator
      expect(requestUrl).not.toContain('%3F'); // Should not have encoded question mark
      expect(requestUrl).toContain('attendees=user1%40example.com');
      expect(requestUrl).toContain('attendees=user2%40example.com');
      expect(requestUrl).toContain('event_type=default');
      expect(requestUrl).toContain('event_type=outOfOffice');
    });

    it('should handle complex metadata pairs correctly', async () => {
      const baseUrl = new URL('https://api.nylas.com/v3/grants/grant-id/events');
      const queryParams = {
        calendarId: 'primary',
        metadataPair: { 
          'key with spaces': 'value with & symbols',
          'another-key': 'another-value',
          'special-chars': 'value with ? and = signs'
        },
      };

      const realApiClient = new APIClient({
        apiKey: 'test-api-key',
        apiUri: 'https://api.nylas.com',
        timeout: 30,
        headers: {},
      });

      const setQueryStrings = (realApiClient as any).setQueryStrings.bind(realApiClient);
      const finalUrl = setQueryStrings(baseUrl, queryParams);
      const requestUrl = finalUrl.toString();
      
      // Verify metadata pairs are handled correctly
      expect(requestUrl).toContain('?'); // Should have proper query separator
      expect(requestUrl).not.toContain('%3F'); // Should not have encoded question mark
      expect(requestUrl).toContain('metadata_pair=key%20with%20spaces%3Avalue%20with%20%26%20symbols');
      expect(requestUrl).toContain('metadata_pair=another-key%3Aanother-value');
      expect(requestUrl).toContain('metadata_pair=special-chars%3Avalue%20with%20%3F%20and%20%3D%20signs');
    });
  });
});
