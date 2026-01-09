---
name: add-query-params
description: Add query parameter support to a Nylas SDK endpoint
---

# Add Query Parameters

Add query parameter support to an endpoint.

## Steps

1. **Define interface** in `src/models/{resource}.ts`:
   ```typescript
   export interface List{Resource}QueryParams {
     limit?: number;
     pageToken?: string;
     // Add new params
     filter?: string;
     orderBy?: 'asc' | 'desc';
   }
   ```

2. **Update method signature** in `src/resources/{resource}.ts`:
   ```typescript
   public list(
     params: {
       identifier: string;
       queryParams?: List{Resource}QueryParams;
     },
     overrides?: Overrides
   ) {
     return this._list<{Resource}>({
       path: `/v3/grants/${params.identifier}/{resource}s`,
       queryParams: params.queryParams,
       overrides,
     });
   }
   ```

3. **Add test case**:
   ```typescript
   it('should pass query params', async () => {
     apiClient.request.mockResolvedValue({ data: [] });
     await resource.list({
       identifier: 'grant-123',
       queryParams: { limit: 10, filter: 'active' },
     });
     expect(apiClient.request).toHaveBeenCalledWith({
       method: 'GET',
       path: '/v3/grants/grant-123/{resource}s',
       queryParams: { limit: 10, filter: 'active' },
       overrides: undefined,
     });
   });
   ```

4. **Verify**: `npm test -- tests/resources/{resource}.spec.ts`
