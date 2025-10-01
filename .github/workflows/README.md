# GitHub Actions Workflows

This directory contains GitHub Actions workflows for testing the Nylas Node.js SDK in various environments, including Cloudflare Workers.

## Workflows

### `cloudflare-simple-test.yml`
**Recommended approach** - Simple and effective Cloudflare Workers testing:
- Uses Cloudflare's `nodejs_compat` environment to test our existing SDK
- Runs compatibility tests locally without requiring Cloudflare deployment
- Tests both CommonJS and ESM builds
- Validates optional types work correctly in Cloudflare Workers context
- Optional deployment testing (requires secrets)

### `cloudflare-nodejs-compat-test.yml`
More comprehensive testing using Cloudflare Workers:
- Creates a test worker that runs SDK tests in `nodejs_compat` environment
- Tests locally using `wrangler dev`
- Validates SDK functionality in actual Cloudflare Workers runtime

### `cloudflare-vitest-test.yml`
Advanced testing using Cloudflare's Vitest integration:
- Uses `@cloudflare/vitest-pool-workers` for integration testing
- Runs tests directly in Cloudflare Workers context
- More sophisticated testing setup

## Why This Approach Works

### **Cloudflare `nodejs_compat` Environment**
- Cloudflare Workers supports Node.js compatibility through the `nodejs_compat` flag
- This allows us to run our existing Node.js code (including the Nylas SDK) in Cloudflare Workers
- We can test the exact same code that users will run in production

### **Testing Optional Types**
The main issue we're addressing is ensuring optional types work correctly in Cloudflare Workers. Our tests verify:
- SDK can be imported in Cloudflare Workers context
- Client can be created with minimal configuration (tests optional types)
- All optional properties work without TypeScript errors
- Both CommonJS and ESM builds are compatible

## Local Testing

You can test Cloudflare Workers compatibility locally:

```bash
# Run the compatibility test
npm run test:cloudflare

# Or run the test script directly
node test-cloudflare-compat.js
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