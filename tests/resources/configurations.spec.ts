import APIClient from '../../src/apiClient';
import { Configurations } from '../../src/resources/configurations';
jest.mock('../src/apiClient');

describe('Configurations', () => {
  let apiClient: jest.Mocked<APIClient>;
  let configurations: Configurations;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    configurations = new Configurations(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with correct params', async () => {
      await configurations.list({
        identifier: 'grant123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' }
        }
      })

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant123/scheduling/configurations',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' }
        }
      })
    })
  })

  describe('find', () => {
    it('should call apiClient.request with correct params', async () => {
      await configurations.find({
        identifier: 'grant123',
        configurationId: 'configuration123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' }
        }
      })

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant123/scheduling/configurations/configuration123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' }
        }
      })
    })
  })

  describe('create', () => {
    it('should call apiClient.request with correct params', async () => {
      await configurations.create({
        identifier: 'grant123',
        requestBody: {
          "requiresSessionAuth": false,
          "participants": [
            {
              "name": "Test",
              "email": "nylassdk@nylas.com",
              "availability": {
                "calendarIds": [
                  "primary"
                ]
              },
              "booking": {
                "calendarId": "primary"
              }
            }
          ],
          "availability": {
            "durationMinutes": 30
          },
          "eventBooking": {
            "title": "My test event"
          }
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' }
        }
      })

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/grant123/scheduling/configurations',
        body: {
          "requiresSessionAuth": false,
          "participants": [
            {
              "name": "Test",
              "email": "nylassdk@nylas.com",
              "availability": {
                "calendarIds": [
                  "primary"
                ]
              },
              "booking": {
                "calendarId": "primary"
              }
            }
          ],
          "availability": {
            "durationMinutes": 30
          },
          "eventBooking": {
            "title": "My test event"
          }
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' }
        }
      })
    })
  })

  describe('update', () => {
    it('should call apiClient.request with the correct params', async () => {
      await configurations.update({
        identifier: 'grant123',
        configurationId: 'configuration123',
        requestBody: {
          eventBooking: {
            title: "Changed Title"
          }
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' }
        }
      })

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/grants/grant123/scheduling/configurations/configuration123',
        body: {
          eventBooking: {
            title: "Changed Title"
          }
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' }
        }
      })
    })
  })

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await configurations.destroy({
        identifier: 'grant123',
        configurationId: 'configuration123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' }
        }
      })

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/grant123/scheduling/configurations/configuration123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' }
        }
      })
    })
  })
})