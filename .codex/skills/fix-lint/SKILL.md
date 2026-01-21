---
name: fix-lint
description: Fix ESLint and Prettier issues in the Nylas SDK
---

# Fix Lint Errors

Resolve linting and formatting issues.

## Steps

1. **Auto-fix most issues**:
   ```bash
   npm run lint:fix
   npm run lint:prettier
   ```

2. **Common manual fixes**:

   - **Missing return type**:
     ```typescript
     // Wrong
     public async list(params) {
     // Correct
     public async list(params: ListParams): Promise<NylasResponse<T>> {
     ```

   - **Unused variable**:
     ```typescript
     // Remove or prefix with underscore
     const _unusedVar = something;
     ```

   - **Prefer const**:
     ```typescript
     // Wrong
     let value = 'fixed';
     // Correct
     const value = 'fixed';
     ```

   - **No explicit any**:
     ```typescript
     // Wrong
     function process(data: any) {
     // Correct
     function process(data: Record<string, unknown>) {
     ```

3. **Verify**:
   ```bash
   npm run lint
   npm run lint:prettier:check
   ```
