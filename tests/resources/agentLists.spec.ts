import APIClient from '../../src/apiClient';
import type { CreateAgentListRequest } from '../../src/models/agentLists';
import { AgentLists } from '../../src/resources/agentLists';

jest.mock('../../src/apiClient');

describe('AgentLists', () => {
  let apiClient: jest.Mocked<APIClient>;
  let lists: AgentLists;

  const validCreateRequest = {
    name: 'Blocked domains',
    description: 'Domains we have identified as sending unwanted mail.',
    type: 'domain',
  } satisfies CreateAgentListRequest;

  const createRequestWithServerFields = {
    name: 'Blocked domains',
    type: 'domain',
    // @ts-expect-error Create requests exclude server-derived/internal fields.
    id: 'list123',
  } satisfies CreateAgentListRequest;

  void validCreateRequest;
  void createRequestWithServerFields;

  beforeEach(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    lists = new AgentLists(apiClient);
    apiClient.request.mockResolvedValue({ data: [] });
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await lists.list({
        queryParams: {
          limit: 10,
        },
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/lists',
        queryParams: {
          limit: 10,
        },
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should forward cursor pagination params', async () => {
      await lists.list({
        queryParams: {
          limit: 10,
          pageToken: 'cursor123',
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/lists',
        queryParams: {
          limit: 10,
          pageToken: 'cursor123',
        },
        overrides: undefined,
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await lists.find({
        listId: 'list123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/lists/list123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should encode listId path params', async () => {
      await lists.find({
        listId: 'list/123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/lists/list%2F123',
        overrides: undefined,
      });
    });
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      const requestBody: CreateAgentListRequest = {
        name: 'Blocked domains',
        description: 'Domains we have identified as sending unwanted mail.',
        type: 'domain' as const,
      };

      await lists.create({
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/lists',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should create a list with only required public fields', async () => {
      const requestBody: CreateAgentListRequest = {
        name: 'VIP addresses',
        type: 'address',
      };

      await lists.create({ requestBody });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/lists',
        body: requestBody,
        overrides: undefined,
      });
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params', async () => {
      const requestBody = {
        description: 'Updated description.',
      };

      await lists.update({
        listId: 'list123',
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/lists/list123',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should encode listId path params', async () => {
      const requestBody = {
        name: 'Updated list',
      };

      await lists.update({
        listId: 'list/123',
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/lists/list%2F123',
        body: requestBody,
        overrides: undefined,
      });
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await lists.destroy({
        listId: 'list123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/lists/list123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should encode listId path params', async () => {
      await lists.destroy({
        listId: 'list/123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/lists/list%2F123',
        overrides: undefined,
      });
    });
  });

  describe('listItems', () => {
    it('should call apiClient.request with the correct params', async () => {
      await lists.listItems({
        listId: 'list123',
        queryParams: {
          limit: 50,
        },
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/lists/list123/items',
        queryParams: {
          limit: 50,
        },
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should encode listId path params', async () => {
      await lists.listItems({
        listId: 'list/123',
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/lists/list%2F123/items',
        queryParams: undefined,
        overrides: undefined,
      });
    });
  });

  describe('addItems', () => {
    it('should call apiClient.request with the correct params', async () => {
      const requestBody = {
        items: ['spam-domain.com', 'another-bad-domain.net'],
      };

      await lists.addItems({
        listId: 'list123',
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/lists/list123/items',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should encode listId path params', async () => {
      const requestBody = {
        items: ['vip@example.com'],
      };

      await lists.addItems({
        listId: 'list/123',
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/lists/list%2F123/items',
        body: requestBody,
        overrides: undefined,
      });
    });
  });

  describe('removeItems', () => {
    it('should call apiClient.request with the correct params', async () => {
      const requestBody = {
        items: ['spam-domain.com'],
      };

      await lists.removeItems({
        listId: 'list123',
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/lists/list123/items',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should encode listId path params', async () => {
      const requestBody = {
        items: ['vip@example.com'],
      };

      await lists.removeItems({
        listId: 'list/123',
        requestBody,
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/lists/list%2F123/items',
        body: requestBody,
        overrides: undefined,
      });
    });
  });
});
