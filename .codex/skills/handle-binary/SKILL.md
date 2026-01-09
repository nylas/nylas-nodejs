---
name: handle-binary
description: Handle binary and stream responses in Nylas SDK endpoints
---

# Handle Binary/Stream Responses

Implement endpoints that return binary data or streams.

## For Binary Data (Buffer)

Use `_getRaw` method:

```typescript
public async download(
  params: {
    identifier: string;
    attachmentId: string;
  },
  overrides?: Overrides
): Promise<Buffer> {
  return this._getRaw({
    path: `/v3/grants/${params.identifier}/attachments/${params.attachmentId}/download`,
    overrides,
  });
}
```

## For Streaming Data

Use `_getStream` method:

```typescript
public async downloadStream(
  params: {
    identifier: string;
    attachmentId: string;
  },
  overrides?: Overrides
): Promise<NodeJS.ReadableStream> {
  return this._getStream({
    path: `/v3/grants/${params.identifier}/attachments/${params.attachmentId}/download`,
    overrides,
  });
}
```

## Test Pattern

```typescript
describe('download', () => {
  it('should return binary data', async () => {
    const mockBuffer = Buffer.from('test data');
    apiClient.requestRaw.mockResolvedValue(mockBuffer);

    const result = await resource.download({
      identifier: 'grant-123',
      attachmentId: 'attach-456',
    });

    expect(result).toEqual(mockBuffer);
  });
});
```
