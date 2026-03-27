---
name: add-endpoint
description: Add a new API endpoint method to an existing Nylas SDK resource
---

# Add Endpoint to Existing Resource

Add a new method to an existing resource class.

## Steps

1. **Add types** to `src/models/{resource}.ts`:
   ```typescript
   export interface {Method}Request {
     // Request body fields
   }

   export interface {Method}Response {
     // Response fields (if different from main type)
   }

   export interface {Method}QueryParams {
     // Query parameters (if needed)
   }
   ```

2. **Add method** to `src/resources/{resource}.ts`:
   ```typescript
   public async {methodName}(
     params: {
       identifier: string;
       id: string;
       requestBody: {Method}Request;
     },
     overrides?: Overrides
   ) {
     return this._create<{Method}Response>({
       path: `/v3/grants/${params.identifier}/{resource}/${params.id}/action`,
       requestBody: params.requestBody,
       overrides,
     });
   }
   ```

3. **Add test** to `tests/resources/{resource}.spec.ts`:
   ```typescript
   describe('{methodName}', () => {
     it('should call API with correct parameters', async () => {
       apiClient.request.mockResolvedValue({ data: {} });
       await resource.{methodName}({
         identifier: 'grant-123',
         id: 'resource-456',
         requestBody: { /* test data */ },
       });
       expect(apiClient.request).toHaveBeenCalledWith({
         method: 'POST',
         path: '/v3/grants/grant-123/{resource}/resource-456/action',
         body: { /* test data */ },
         overrides: undefined,
       });
     });
   });
   ```

4. **Verify**: `npm test -- tests/resources/{resource}.spec.ts`
