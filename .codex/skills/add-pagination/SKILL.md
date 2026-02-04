---
name: add-pagination
description: Implement pagination support for Nylas SDK list endpoints
---

# Add Pagination Support

Implement paginated list endpoints with async iterator support.

## Implementation

The `_list` method automatically returns an `AsyncListResponse` with pagination:

```typescript
public list(
  params: {
    identifier: string;
    queryParams?: ListQueryParams;
  },
  overrides?: Overrides
) {
  return this._list<ResourceType>({
    path: `/v3/grants/${params.identifier}/resources`,
    queryParams: params.queryParams,
    overrides,
  });
}
```

## Query Params Interface

```typescript
export interface ListQueryParams {
  limit?: number;      // Items per page (default varies by endpoint)
  pageToken?: string;  // Token for next page
}
```

## Usage Examples

**Async Iterator (recommended)**:
```typescript
const resources = nylas.resources.list({ identifier: 'grant-123' });

for await (const resource of resources) {
  console.log(resource);
}
```

**Manual Pagination**:
```typescript
const page1 = await nylas.resources.list({
  identifier: 'grant-123',
  queryParams: { limit: 10 },
});

if (page1.nextPageToken) {
  const page2 = await nylas.resources.list({
    identifier: 'grant-123',
    queryParams: { limit: 10, pageToken: page1.nextPageToken },
  });
}
```

## Test Pattern

```typescript
it('should support pagination', async () => {
  apiClient.request.mockResolvedValue({
    data: [{ id: '1' }],
    nextPageToken: 'token123',
  });

  const result = await resource.list({
    identifier: 'grant-123',
    queryParams: { limit: 1 },
  });

  expect(result.nextPageToken).toBe('token123');
});
```
