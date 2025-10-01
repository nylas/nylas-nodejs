# GitHub Actions Workflows

This directory contains GitHub Actions workflows for testing the Nylas Node.js SDK in various environments, including Cloudflare Workers.

## Workflows

### `ci.yml`
Comprehensive CI workflow that tests the SDK across:
- Multiple Node.js versions (16, 18, 20, 22)
- Cloudflare Workers environment
- Edge-like environments with memory constraints
- Different module formats (CommonJS, ESM, CJS wrapper)
- Security audits

### `cloudflare-workers-test.yml`
Focused workflow for testing Cloudflare Workers compatibility:
- Tests SDK in Cloudflare Workers environment
- Validates optional types work correctly
- Tests both CommonJS and ESM builds
- Optional deployment testing (requires secrets)

## Cloudflare Workers Testing Setup

### Required Secrets

To enable full Cloudflare Workers testing (including deployment), add these secrets to your GitHub repository:

1. **CLOUDFLARE_API_TOKEN**: Your Cloudflare API token
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → My Profile → API Tokens
   - Create a token with "Edit Cloudflare Workers" permissions
   - Copy the token value

2. **CLOUDFLARE_ACCOUNT_ID**: Your Cloudflare account ID
   - Find this in your Cloudflare dashboard under "Overview"

### Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add both `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

### Testing Without Secrets

The workflows will still run and test Cloudflare Workers compatibility even without these secrets. The deployment step will be skipped, but all local testing will still occur.

### Local Testing

You can also test Cloudflare Workers compatibility locally:

```bash
# Install dependencies
npm ci

# Build the SDK
npm run build

# Test in the edge environment
cd examples/edge-environment
npm install
npm run dev  # Start local development server
```

## What Gets Tested

### Cloudflare Workers Environment
- SDK can be imported in Cloudflare Workers context
- Optional types work correctly (no TypeScript errors)
- Both CommonJS and ESM builds are compatible
- Client creation works without errors
- Memory constraints are handled properly

### Edge-like Environments
- Tests with reduced memory limits (64MB, 128MB)
- Optimized Node.js settings for compact environments
- Verifies SDK works in constrained environments

### Module Format Compatibility
- CommonJS (`require()`)
- ESM (`import`)
- CJS wrapper for better compatibility

## Troubleshooting

### Common Issues

1. **Worker deployment fails**: Check that your Cloudflare API token has the correct permissions
2. **Type errors in Workers**: Ensure optional types are properly defined in the SDK
3. **Memory issues**: The edge environment tests help identify memory-related problems

### Debugging

- Check the workflow logs for specific error messages
- Test locally using the edge environment example
- Verify your Cloudflare account has Workers enabled