---
name: fix-typescript
description: Fix TypeScript compilation errors in the Nylas SDK
---

# Fix TypeScript Errors

Resolve TypeScript compilation errors.

## Steps

1. **Run build** to see errors:
   ```bash
   npm run build
   ```

2. **Common fixes**:

   - **Missing `.js` extension** in imports (required for ESM):
     ```typescript
     // Wrong
     import { Calendar } from '../models/calendars';
     // Correct
     import { Calendar } from '../models/calendars.js';
     ```

   - **Missing optional marker**:
     ```typescript
     // Wrong - if property can be undefined
     createdAt: number;
     // Correct
     createdAt?: number;
     ```

   - **Type mismatch**:
     ```typescript
     // Check interface definitions in src/models/
     // Ensure request/response types match API spec
     ```

   - **Missing export**:
     ```typescript
     // Add to src/models/index.ts if new types
     export * from './{model}.js';
     ```

3. **Verify**: `npm run build`
