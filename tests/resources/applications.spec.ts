import {
  describe,
  it,
  expect,
  _beforeEach,
  beforeAll,
  _afterEach,
  _afterAll,
  vi,
} from 'vitest';
import APIClient from '../../src/apiClient';
import { Applications } from '../../src/resources/applications';

vi.mock('../../src/apiClient');

describe('Applications', () => {
  let apiClient: any;
  let applications: Applications;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://api.nylas.com',
      timeout: 30,
      headers: {},
    }) as any;

    applications = new Applications(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('getDetails', () => {
    it('should call apiClient.request with the correct params', async () => {
      await applications.getDetails({
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/applications',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should call apiClient.request even without overrides set', async () => {
      await applications.getDetails();

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/applications',
      });
    });
  });

  describe('constructor', () => {
    it('should initialize the redirect-uri resource', () => {
      expect(applications.redirectUris.constructor.name).toBe('RedirectUris');
    });
  });
});
