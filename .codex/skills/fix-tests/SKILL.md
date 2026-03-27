---
name: fix-tests
description: Fix failing Jest tests in the Nylas SDK
---

# Fix Test Failures

Resolve failing Jest tests.

## Steps

1. **Run tests** to see failures:
   ```bash
   npm test
   ```

2. **Common fixes**:

   - **Mock not set up**:
     ```typescript
     import APIClient from '../../src/apiClient';
     jest.mock('../../src/apiClient');

     let apiClient: jest.Mocked<APIClient>;
     beforeEach(() => {
       apiClient = new APIClient({ apiKey: 'test' }) as jest.Mocked<APIClient>;
     });
     ```

   - **Mock return value missing**:
     ```typescript
     apiClient.request.mockResolvedValue({ data: expectedData });
     ```

   - **Wrong path in assertion**:
     ```typescript
     expect(apiClient.request).toHaveBeenCalledWith({
       method: 'GET',
       path: '/v3/grants/grant-id/resources',  // Check path matches
       overrides: undefined,
     });
     ```

   - **Async not awaited**:
     ```typescript
     it('should work', async () => {
       await resource.list({ identifier: 'grant-id' });
     });
     ```

3. **Run single test**:
   ```bash
   npm test -- tests/resources/{name}.spec.ts
   ```

4. **Verify all**: `npm test`
