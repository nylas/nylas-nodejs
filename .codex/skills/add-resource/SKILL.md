---
name: add-resource
description: Create a new API resource with model, resource class, and tests for the Nylas SDK
---

# Add New Resource

Create a complete new API resource for the Nylas Node.js SDK.

## Steps

1. **Create model** `src/models/{name}.ts`:
   ```typescript
   export interface {Name} {
     id: string;
     grantId: string;
     // Add properties
   }

   export interface Create{Name}Request {
     // Required fields
   }

   export interface List{Name}QueryParams {
     limit?: number;
     pageToken?: string;
   }
   ```

2. **Create resource** `src/resources/{name}.ts`:
   ```typescript
   import { Resource } from './resource.js';
   import { Overrides } from '../config.js';
   import { {Name}, Create{Name}Request } from '../models/{name}.js';

   export class {Name}s extends Resource {
     public list(params: { identifier: string }, overrides?: Overrides) {
       return this._list<{Name}>({
         path: `/v3/grants/${params.identifier}/{name}s`,
         overrides,
       });
     }

     public find(params: { identifier: string; id: string }, overrides?: Overrides) {
       return this._find<{Name}>({
         path: `/v3/grants/${params.identifier}/{name}s/${params.id}`,
         overrides,
       });
     }

     public create(params: { identifier: string; requestBody: Create{Name}Request }, overrides?: Overrides) {
       return this._create<{Name}>({
         path: `/v3/grants/${params.identifier}/{name}s`,
         requestBody: params.requestBody,
         overrides,
       });
     }
   }
   ```

3. **Register in** `src/nylas.ts`:
   - Add import: `import { {Name}s } from './resources/{name}.js';`
   - Add property: `public {name}s: {Name}s;`
   - Initialize: `this.{name}s = new {Name}s(this.apiClient);`

4. **Create test** `tests/resources/{name}.spec.ts`:
   - Mock APIClient
   - Test list, find, create methods
   - Verify request parameters

5. **Verify**: `npm test -- tests/resources/{name}.spec.ts`
