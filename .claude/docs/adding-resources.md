# Adding New Resources

## Step 1: Create Model
Copy `.claude/shared/model-template.ts` to `src/models/{name}.ts`

Replace placeholders:
- `{{ResourceName}}` → PascalCase (e.g., `Calendar`)
- `{{resourceName}}` → camelCase (e.g., `calendar`)

Add to `src/models/index.ts` exports.

## Step 2: Create Resource
Copy `.claude/shared/resource-template.ts` to `src/resources/{name}.ts`

Key patterns:
- Extend `Resource` class
- Use `_list`, `_find`, `_create`, `_update`, `_destroy` helpers
- Define path: `/v3/grants/${identifier}/{resources}`
- Accept `Overrides` as last parameter

## Step 3: Register Resource
In `src/nylas.ts`:
1. Import the resource class
2. Add public property: `public {name}: {Name}s;`
3. Initialize in constructor: `this.{name} = new {Name}s(this.apiClient);`

## Step 4: Create Tests
Copy `.claude/shared/test-template.spec.ts` to `tests/resources/{name}.spec.ts`

Test patterns:
- Mock APIClient with `jest.mock('../../src/apiClient')`
- Test each public method
- Verify request parameters
- Test with/without overrides

## Step 5: Verify
```bash
make test-resource NAME={name}
make ci
```
