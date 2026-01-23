# Release Please Setup & Testing Guide

This document provides setup instructions and testing procedures for the Release Please automation workflows.

## Prerequisites

### 1. GitHub Secret Configuration

The automated release workflows require an npm authentication token to publish packages. A repository administrator must configure this secret:

**Secret Name**: `NPM_TOKEN`

**How to obtain the token**:
1. Access 1Password and locate the nylas-admin npm account credentials
2. Log in to npmjs.com with the nylas-admin account
3. Go to Account Settings > Access Tokens
4. Create a new "Automation" token (or use existing token if available)
5. Copy the token value

**How to add the secret to GitHub**:
1. Navigate to the repository on GitHub
2. Go to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste the npm token
6. Click "Add secret"

### 2. Verify Workflow Files

Ensure the following workflow files exist in `.github/workflows/`:
- `release-please.yml` - Creates/updates release PRs
- `publish.yml` - Manually publishes to npm
- `canary.yml` - Automatically publishes canary releases

### 3. Verify Configuration Files

Ensure the following configuration files exist in the repository root:
- `.release-please-config.json` - Release Please configuration
- `.release-please-manifest.json` - Tracks current version

## Testing the Release Please Workflow

### Test 1: Release PR Creation

**Objective**: Verify Release Please creates a release PR after changes are merged to main.

**Steps**:
1. Merge this feature branch (`feature/release-please-automation`) to `main`
2. Wait for the "Release Please" workflow to complete (check Actions tab)
3. Verify a PR is created with title like "chore: release 8.0.1" or "chore: release 8.1.0"
4. Review the PR to ensure:
   - Version is bumped in `package.json`
   - Version is updated in `src/version.ts`
   - `CHANGELOG.md` is updated with changes
   - `.release-please-manifest.json` reflects the new version

**Expected Result**: A release PR is created automatically with all version updates.

### Test 2: Manual Editing of Release PR

**Objective**: Verify you can edit the changelog before merging.

**Steps**:
1. On the release PR created in Test 1, click "Files changed"
2. Edit the `CHANGELOG.md` file to add:
   - More detailed descriptions
   - Links to related GitHub issues (e.g., `#123`)
   - Links to related PRs (e.g., `#456`)
   - Credits to contributors
3. Commit the changes to the release PR branch
4. Verify the PR updates with your edits

**Expected Result**: Your manual edits are preserved in the release PR.

### Test 3: Manual Publish Workflow

**Objective**: Verify the manual publish workflow works correctly.

**Steps**:
1. **DO NOT merge the release PR yet** (for this test)
2. Go to Actions > Publish Package
3. Click "Run workflow"
4. Enter:
   - version: `v8.0.0` (current version)
   - npm_tag: `canary` (to avoid overwriting latest)
5. Click "Run workflow"
6. Monitor the workflow execution
7. Check for any errors in the build or publish steps

**Expected Result**: 
- Workflow completes successfully
- Package is published to npm with `canary` tag
- No test files are found in `/src`

**Verification**:
```bash
npm view nylas@canary version
```

### Test 4: Canary Release via Branch

**Objective**: Verify automatic canary releases work from `canary/*` branches.

**Steps**:
1. Create a new branch: `canary/test-automation`
   ```bash
   git checkout -b canary/test-automation main
   ```
2. Make a small change (e.g., add a comment to README.md)
3. Commit and push:
   ```bash
   git add .
   git commit -m "test: canary release automation"
   git push origin canary/test-automation
   ```
4. Go to Actions > Canary Release
5. Wait for the workflow to complete
6. Check the workflow logs for the generated canary version

**Expected Result**: 
- Workflow completes successfully
- A canary version is published (e.g., `8.0.0-canary.20260123120000.abc1234`)
- Package is available with `canary` tag

**Verification**:
```bash
npm view nylas@canary version
```

### Test 5: Full Release Process (End-to-End)

**Objective**: Complete a full release cycle from PR to npm publication.

**Steps**:
1. Ensure the release PR from Test 1 is ready
2. Edit the `CHANGELOG.md` in the release PR with proper formatting:
   - Add issue/PR references
   - Add contributor credits
   - Ensure dates are correct
3. Get approval from team members (if required)
4. Merge the release PR
5. Verify a new git tag is created (check repository tags)
6. Go to Actions > Publish Package
7. Click "Run workflow"
8. Enter:
   - version: The tag created by the release PR (e.g., `v8.0.1`)
   - npm_tag: `latest`
9. Click "Run workflow"
10. Monitor the workflow execution
11. Once complete, visit https://www.npmjs.com/package/nylas
12. Verify the new version is shown as "latest"

**Expected Result**: 
- Release PR merges successfully
- Git tag is created
- Package is published to npm with `latest` tag
- npm registry shows the new version

**Final Verification**:
```bash
npm view nylas version
npm install nylas@latest
```

## Troubleshooting

### Issue: NPM_TOKEN Secret Not Found

**Error**: `Error: Input required and not supplied: token`

**Solution**: 
- Verify `NPM_TOKEN` secret is configured in GitHub repository settings
- Check that the secret name is exactly `NPM_TOKEN` (case-sensitive)
- Ensure the token has not expired

### Issue: Release Please Doesn't Create PR

**Possible Causes**:
1. No changes have been merged to `main` since last release
2. Configuration files are missing or invalid
3. Permissions are not set correctly in the workflow file

**Solution**:
- Verify `.release-please-config.json` and `.release-please-manifest.json` exist
- Check workflow file has `contents: write` and `pull-requests: write` permissions
- Ensure changes were actually merged (not just pushed) to `main`

### Issue: Publish Workflow Fails with "Test Files Found"

**Error**: `Error: Test files found in /src directory`

**Solution**:
- Check if any `.spec.ts` or `.test.ts` files exist in `src/`
- All test files should be in the `tests/` directory
- Move any test files out of `src/` before publishing

### Issue: Version Mismatch in src/version.ts

**Possible Cause**: `exportVersion.js` script not running

**Solution**:
- Verify `package.json` has the `version` hook: `"version": "npm run export-version && git add src/version.ts"`
- Manually run: `npm run export-version`
- Commit the updated `src/version.ts`

## Rollback Procedure

If the automated release process encounters issues:

1. **Remove Release Please workflows** (temporarily):
   ```bash
   git mv .github/workflows/release-please.yml .github/workflows/release-please.yml.disabled
   git commit -m "chore: temporarily disable Release Please"
   git push
   ```

2. **Use the manual release process** documented in `Contributing.md` under "Legacy Manual Release Process"

3. **Re-enable after fixing issues**:
   ```bash
   git mv .github/workflows/release-please.yml.disabled .github/workflows/release-please.yml
   git commit -m "chore: re-enable Release Please"
   git push
   ```

## Additional Resources

- [Release Please Documentation](https://github.com/googleapis/release-please)
- [Release Please Action](https://github.com/googleapis/release-please-action)
- [npm Publishing Documentation](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
