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
      await notetakers.leave({
        identifier: 'id123',
        notetakerId: 'notetaker123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/notetakers/notetaker123/leave',
      });
    });

    it('should remove a notetaker from a meeting with overrides', async () => {
      await notetakers.leave({
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
    });

    it('should remove a notetaker from a meeting without identifier', async () => {
      await notetakers.leave({
        notetakerId: 'notetaker123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/notetakers/notetaker123/leave',
      });
    });
  });

  describe('downloadMedia', () => {
    it('should download media with identifier', async () => {
      await notetakers.downloadMedia({
        identifier: 'id123',
        notetakerId: 'notetaker123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/notetakers/notetaker123/media',
      });
    });

    it('should download media without identifier', async () => {
      await notetakers.downloadMedia({
        notetakerId: 'notetaker123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/notetakers/notetaker123/media',
      });
    });
  });
});
