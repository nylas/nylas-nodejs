import APIClient from '../../src/apiClient';
import { Workspaces } from '../../src/resources/workspaces';

jest.mock('../../src/apiClient');

describe('Workspaces', () => {
  let apiClient: jest.Mocked<APIClient>;
  let workspaces: Workspaces;

  beforeEach(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    workspaces = new Workspaces(apiClient);
    apiClient.request.mockResolvedValue({ data: [] });
  });

  describe('list', () => {
    it('should call apiClient.request with a GET to the collection path', async () => {
      await workspaces.list({
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/workspaces',
        queryParams: undefined,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with a GET to the workspace path', async () => {
      await workspaces.find({
        workspaceId: 'workspace123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/workspaces/workspace123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('create', () => {
    it('should call apiClient.request with a POST and the create body', async () => {
      const requestBody = {
        name: 'Acme Workspace',
        domain: 'acme.com',
        autoGroup: true,
        policyId: 'policy123',
        rulesIds: ['rule123', 'rule456'],
      };

      await workspaces.create({
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/workspaces',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('update', () => {
    it('should issue a PATCH (not PUT) to the workspace path with the update body', async () => {
      const requestBody = {
        name: 'Renamed Workspace',
        policyId: null,
        rulesIds: ['rule789'],
      };

      await workspaces.update({
        workspaceId: 'workspace123',
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/v3/workspaces/workspace123',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with a DELETE to the workspace path', async () => {
      await workspaces.destroy({
        workspaceId: 'workspace123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/workspaces/workspace123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('autoGroup', () => {
    it('should POST the filters to the auto-group sub-path', async () => {
      const requestBody = {
        afterCreatedAt: 1700000000,
        invalidAlso: true,
        specificDomain: 'acme.com',
      };

      await workspaces.autoGroup({
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/workspaces/auto-group',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should POST an empty body when no filters are provided', async () => {
      await workspaces.autoGroup();

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/workspaces/auto-group',
        body: {},
        overrides: undefined,
      });
    });
  });

  describe('manualAssign', () => {
    it('should POST assign/remove grants to the manual-assign sub-path', async () => {
      const requestBody = {
        assignGrants: ['grant123', 'grant456'],
        removeGrants: ['grant789'],
      };

      await workspaces.manualAssign({
        workspaceId: 'workspace123',
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/workspaces/workspace123/manual-assign',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });
});
