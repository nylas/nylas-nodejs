import APIClient from '../../src/apiClient';
import { Rules } from '../../src/resources/rules';

jest.mock('../../src/apiClient');

describe('Rules', () => {
  let apiClient: jest.Mocked<APIClient>;
  let rules: Rules;

  beforeEach(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    rules = new Rules(apiClient);
    apiClient.request.mockResolvedValue({ data: [] });
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await rules.list({
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
        path: '/v3/rules',
        queryParams: {
          limit: 10,
        },
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    // GROUND TRUTH (source-verified): GET /v3/rules returns a NESTED list envelope.
    // The inbox service serializes a ListWithCursorResult straight into `data`, so
    // after the SDK camelCase transform the apiClient yields
    // { requestId, data: { items: Rule[], nextCursor? } } — NOT the flat
    // { requestId, data: Rule[], nextCursor } that every other list endpoint returns
    // (proven by inbox/internal/rule/interface_http_find.go using
    // NewFiberSuccessResponse on a ListWithCursorResult, vs policies using
    // NewFiberSuccessListWithCursorResponse). The base list machinery must normalize
    // this nested shape so the public surface stays consistent: callers still get
    // result.data as an array and result.nextCursor at the top level. If the
    // normalization is removed, result.data is the {items,nextCursor} OBJECT (so
    // toHaveLength / [0].id fail) and result.nextCursor is undefined.
    it('should normalize the nested rules list envelope to the flat surface', async () => {
      apiClient.request.mockResolvedValue({
        requestId: 'req-1',
        data: {
          items: [{ id: 'rule123', name: 'Block spam', match: {}, actions: [] }],
          nextCursor: 'cursor-abc',
        },
      });

      const result = await rules.list({});

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('rule123');
      expect(result.nextCursor).toBe('cursor-abc');
    });

    // Back-compat: the normalization is a no-op when an endpoint returns the normal
    // flat list envelope, so a flat response must still pass through untouched.
    it('should leave a flat list envelope untouched (back-compat)', async () => {
      apiClient.request.mockResolvedValue({
        requestId: 'req-1',
        data: [{ id: 'rule123', name: 'Block spam', match: {}, actions: [] }],
        nextCursor: 'cursor-abc',
      });

      const result = await rules.list({});

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('rule123');
      expect(result.nextCursor).toBe('cursor-abc');
    });

    it('should forward pageToken for cursor pagination', async () => {
      await rules.list({
        queryParams: { limit: 10, pageToken: 'cursor-abc' },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/rules',
        queryParams: { limit: 10, pageToken: 'cursor-abc' },
        overrides: undefined,
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await rules.find({
        ruleId: 'rule123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/rules/rule123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      const requestBody = {
        name: 'Block spam domains',
        priority: 1,
        trigger: 'inbound' as const,
        match: {
          operator: 'any' as const,
          conditions: [
            {
              field: 'from.domain' as const,
              operator: 'is' as const,
              value: 'spam-domain.com',
            },
          ],
        },
        actions: [{ type: 'block' as const }],
      };

      await rules.create({
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/rules',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    // in_list conditions carry an array of List IDs, and assign_to_folder carries
    // a target folder ID in `value`. The body must pass through verbatim so the
    // wire receives the array/string shapes the server validates.
    it('should pass through in_list array values and assign_to_folder value', async () => {
      const requestBody = {
        name: 'Route trusted senders',
        trigger: 'inbound' as const,
        match: {
          operator: 'all' as const,
          conditions: [
            {
              field: 'from.address' as const,
              operator: 'in_list' as const,
              value: ['list-1', 'list-2'],
            },
          ],
        },
        actions: [{ type: 'assign_to_folder' as const, value: 'folder-123' }],
      };

      await rules.create({ requestBody });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/rules',
        body: requestBody,
        overrides: undefined,
      });
    });

    it('should deserialize the flat single-object create response', async () => {
      apiClient.request.mockResolvedValue({
        requestId: 'req-2',
        data: { id: 'rule123', name: 'Block spam', match: {}, actions: [] },
      });

      const result = await rules.create({
        requestBody: {
          name: 'Block spam',
          match: { conditions: [] },
          actions: [],
        },
      });

      expect(result.data.id).toBe('rule123');
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params', async () => {
      const requestBody = {
        enabled: false,
      };

      await rules.update({
        ruleId: 'rule123',
        requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/rules/rule123',
        body: requestBody,
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await rules.destroy({
        ruleId: 'rule123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/rules/rule123',
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('listEvaluations', () => {
    it('should call apiClient.request with the correct params', async () => {
      await rules.listEvaluations({
        identifier: 'grant123',
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
        path: '/v3/grants/grant123/rule-evaluations',
        queryParams: {
          limit: 50,
        },
        overrides: {
          apiUri: 'https://override.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    // rule-evaluations returns a flat array with NO next_cursor (the service never
    // computes one). The list must still deserialize cleanly with no cursor, and
    // smtp_rcpt records carry no messageId (the key is absent, not null).
    it('should deserialize the flat array envelope without a cursor', async () => {
      apiClient.request.mockResolvedValue({
        requestId: 'req-3',
        data: [
          {
            id: 'eval-1',
            grantId: 'grant123',
            evaluationStage: 'smtp_rcpt',
            appliedActions: { blocked: true },
          },
        ],
      });

      const result = await rules.listEvaluations({ identifier: 'grant123' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].messageId).toBeUndefined();
      expect(result.data[0].appliedActions?.blocked).toBe(true);
      expect(result.nextCursor).toBeUndefined();
    });
  });
});
