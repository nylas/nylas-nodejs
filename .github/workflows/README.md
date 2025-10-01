# GitHub Actions Workflows

This directory contains GitHub Actions workflows for testing the Nylas Node.js SDK in various environments, including Cloudflare Workers.

## Workflows

### `cloudflare-workers-test.yml`
**Cloudflare Workers Testing** - Jest test suite in Cloudflare Workers:
- Runs our actual Jest test suite in Cloudflare Workers nodejs_compat environment
- Tests the built SDK files (not source files) in production-like environment
- Uses ESM (ECMAScript Modules) for better Cloudflare Workers compatibility
- Tests locally using `wrangler dev` to simulate production environment
- Validates optional types work correctly in Cloudflare Workers context
- Optional deployment testing (requires secrets)

### Existing Workflows
- `clubhouse.yml` - Clubhouse integration
- `pull-reqeust.yml` - Pull request workflow
- `sdk-reference.yaml` - SDK reference documentation

## Why This Approach Works

### **Jest Test Suite in Cloudflare Workers**
- Runs our actual test suite in Cloudflare Workers nodejs_compat environment
- Tests the built SDK files, not source files (as requested)
- Uses ESM which is the native module system for Cloudflare Workers
- Tests the exact same code that users will run in production
- Avoids CommonJS compatibility issues (like mime-db problems)

### **Testing Optional Types**
The main issue we're addressing is ensuring optional types work correctly in Cloudflare Workers. Our tests verify:
- SDK can be imported in Cloudflare Workers context using ESM
- Client can be created with minimal configuration (tests optional types)
- All optional properties work without TypeScript errors
- ESM builds are fully compatible with Cloudflare Workers
- Resource methods work correctly in Cloudflare Workers environment

## Local Testing

You can test Cloudflare Workers compatibility locally:

```bash
# Run the Jest test suite in Cloudflare Workers
npm run test:cloudflare

# Or run the test script directly
node run-tests-cloudflare-final.mjs
```

## GitHub Actions Setup

### Required Secrets (Optional)
To enable deployment testing, add these secrets to your GitHub repository:

1. **CLOUDFLARE_API_TOKEN**: Your Cloudflare API token
2. **CLOUDFLARE_ACCOUNT_ID**: Your Cloudflare account ID

### Workflow Triggers
- Runs on pushes to `cursor/add-cloudflare-worker-to-test-matrix-3aca` and `main`
- Runs on pull requests to `main`
- Can be triggered manually via `workflow_dispatch`

## What Gets Tested

### **Core Compatibility**
- SDK import in Cloudflare Workers environment
- Client creation with minimal and full configurations
- Optional types handling (the main issue we're solving)
- Resource initialization and access

### **Module Format Support**
- CommonJS (`require()`)
- ESM (`import`)
- Both work correctly in Cloudflare Workers

### **Environment Simulation**
- Simulates Cloudflare Workers `nodejs_compat` environment
- Tests with the same constraints as production
- Validates no TypeScript errors occur

## Benefits of This Approach

1. **Simple**: Uses existing test infrastructure
2. **Accurate**: Tests in actual Cloudflare Workers environment
3. **Fast**: No deployment required for basic testing
4. **Comprehensive**: Tests all aspects of SDK compatibility
5. **Maintainable**: Easy to understand and modify

## Troubleshooting

### Common Issues

1. **Test failures**: Check that the SDK is built (`npm run build`)
2. **Import errors**: Ensure all dependencies are installed (`npm ci`)
3. **Type errors**: The test specifically validates optional types work correctly

### Debugging

- Check the workflow logs for specific error messages
- Run `npm run test:cloudflare` locally to debug issues
- Verify your Cloudflare account has Workers enabled (for deployment tests)

## Alternative Approaches

If you need more sophisticated testing, consider:
- Using Cloudflare's Vitest integration (`cloudflare-vitest-test.yml`)
- Creating a dedicated test worker (`cloudflare-nodejs-compat-test.yml`)
- Using Cloudflare's testing tools for integration testing

The simple approach (`cloudflare-simple-test.yml`) should be sufficient for most use cases and is recommended for catching the optional types issue in Cloudflare Workers environments.