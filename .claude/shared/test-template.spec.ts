/**
 * Template for creating tests for new Nylas API resources.
 * Copy this file and replace {{ResourceName}} and {{resourceName}} with your resource names.
 *
 * Usage:
 * - {{ResourceName}} = PascalCase (e.g., "Widgets", "CustomFields")
 * - {{resourceName}} = camelCase (e.g., "widgets", "customFields")
 * - {{resource-name}} = kebab-case for API paths (e.g., "widgets", "custom-fields")
 */

import APIClient from '../../src/apiClient';
import { {{ResourceName}}s } from '../../src/resources/{{resourceName}}';
jest.mock('../../src/apiClient');

describe('{{ResourceName}}s', () => {
  let apiClient: jest.Mocked<APIClient>;
  let {{resourceName}}: {{ResourceName}}s;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    {{resourceName}} = new {{ResourceName}}s(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await {{resourceName}}.list({
        identifier: 'grant-id',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant-id/{{resource-name}}s',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should call apiClient.request with query params', async () => {
      await {{resourceName}}.list({
        identifier: 'grant-id',
        queryParams: {
          limit: 10,
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant-id/{{resource-name}}s',
        queryParams: {
          limit: 10,
        },
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await {{resourceName}}.find({
        identifier: 'grant-id',
        {{resourceName}}Id: '{{resourceName}}-123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant-id/{{resource-name}}s/{{resourceName}}-123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      await {{resourceName}}.create({
        identifier: 'grant-id',
        requestBody: {
          // Add required request body properties
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/grant-id/{{resource-name}}s',
        body: {
          // Match request body properties
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
      await {{resourceName}}.update({
        identifier: 'grant-id',
        {{resourceName}}Id: '{{resourceName}}-123',
        requestBody: {
          // Add update request body properties
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/grants/grant-id/{{resource-name}}s/{{resourceName}}-123',
        body: {
          // Match request body properties
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
      await {{resourceName}}.destroy({
        identifier: 'grant-id',
        {{resourceName}}Id: '{{resourceName}}-123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/grant-id/{{resource-name}}s/{{resourceName}}-123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });
});
