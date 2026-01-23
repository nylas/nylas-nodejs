# Contribute to Nylas
👍🎉 First off, thanks for taking the time to contribute! 🎉👍

The following is a set of guidelines for contributing to the Nylas Node SDK; these are guidelines, not rules, so please use your best judgement and feel free to propose changes to this document via pull request.

# How to Ask a Question

If you have a question about how to use the Node SDK, please [create an issue](https://github.com/nylas/nylas-nodejs/issues) and label it as a question. If you have more general questions about the Nylas Communications Platform, or the Nylas Email, Calendar, and Contacts API, please reach out to support@nylas.com to get help.

# How To Contribute
## Report a Bug or Request a Feature

If you encounter any bugs while using this software, or want to request a new feature or enhancement, please [create an issue](https://github.com/nylas/nylas-nodejs/issues) to report it, and make sure you add a label to indicate what type of issue it is.

## Contribute Code

Pull requests are welcome for bug fixes. If you want to implement something new, [please request a feature](https://github.com/nylas/nylas-nodejs/issues) first so we can discuss it.

While writing your code contribution, make sure you test your changes by running

`npm test`

Our linter can be run with:

`npm run lint`

To use the package during local development, symlink the directory:

`npm link` in the `nylas-nodejs` directory
`npm link nylas` in the directory with your code that uses the package

Please ensure that your contributions don’t cause a decrease to test coverage.

## Creating a Pull Request

Please follow [best practices](https://github.com/trein/dev-best-practices/wiki/Git-Commit-Best-Practices) for creating git commits. When your code is ready to be submitted, you can [submit a pull request](https://help.github.com/articles/creating-a-pull-request/) to begin the code review process.

All PRs from contributors that aren't employed by Nylas must contain the following text in the PR description: "I confirm that this contribution is made under the terms of the MIT license and that I have the authority necessary to make this contribution on behalf of its copyright owner."

# Release Process

## Automated Release Process with Release Please

The Nylas Node SDK uses [Release Please](https://github.com/googleapis/release-please) to automate release PR creation while maintaining manual control over changelog editing and publishing.

### How It Works

1. **Development**: Merge PRs to `main` as usual
2. **Release PR Creation**: Release Please automatically creates or updates a release PR that:
   - Aggregates all changes since the last release
   - Bumps the version in `package.json` and `src/version.ts`
   - Updates `CHANGELOG.md` with all commits
3. **Review & Edit**: Review the release PR and edit the `CHANGELOG.md` if needed to:
   - Add more detailed descriptions
   - Tag related GitHub issues and PRs
   - Give credit to community contributors
4. **Merge**: Merge the release PR when ready
   - This creates a git tag but does NOT publish to npm yet
5. **Publish**: Manually trigger the "Publish Package" workflow from GitHub Actions:
   - Go to Actions > Publish Package > Run workflow
   - Enter the version tag (e.g., `v8.0.1`)
   - Select npm dist-tag (`latest` for stable, `canary` for pre-release)
   - Click "Run workflow"
6. **Verify**: Visit [npmjs.com/package/nylas](https://www.npmjs.com/package/nylas) to confirm publication

### Canary Releases

For testing unreleased changes:

**Option 1: Automatic (Branch-based)**
- Create a branch with the `canary/` prefix (e.g., `canary/test-feature`)
- Push changes to this branch
- The Canary workflow automatically publishes with a timestamped version
- Install with: `npm install nylas@canary`

**Option 2: Manual**
- After merging a release PR, run the "Publish Package" workflow
- Enter the version tag and select `canary` as the npm dist-tag

### Required Setup (For Repository Admins)

The automated workflows require the following GitHub secret to be configured:

- `NPM_TOKEN`: npm authentication token from the nylas-admin account (found in 1Password)

To add this secret:
1. Go to repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: Token from nylas-admin npm account
5. Click "Add secret"

## Legacy Manual Release Process

The following manual process is kept for reference and as a fallback if the automated process needs to be bypassed.

### Prerequisites
- npm account that has write access to the repo
- Use the nylas-admin account in 1Password
- Setup global npm with nylas-admin account to push from the command line
- Use `npm login` to set the npm credentials on your machine to push new versions

### How to Release Manually

1. Create a new branch for the release after all the new changes are merged in main
   - Notation: `vx.x.x-release`
2. Update the "Unreleased" header in the `CHANGELOG.md` to the version of the new SDK and the new date
3. Commit and push
4. Run `npm version vx.x.x` where `vx.x.x` is the new version
   - This will bump the package version to the new version, create a commit, and tag the commit
   - This will also run `scripts/exportVersion.js` to export the version to a ts file that will be used by the SDK to safely set the user agent header
5. Run `git push --tags` to push the tags, then open the PR
6. In the description of the PR add the new version changelog and tag every commit that belongs to each line of the changelog as well as any github issues that it may have closed
   - This allows for leaving a trail for each PR we've closed
7. After confirming that all the CI checks pass, run `npm run build` to build the new version
   - Ensure there's NO test files in `/src` before running the above, else it will get published
8. Publishing:
   - **Canary releases**: Run `npm publish --tag canary`
   - **Promoting a canary release**: Run `npm dist-tag add nylas@[version] latest`
9. Visit [npmjs.com/package/nylas](https://www.npmjs.com/package/nylas) to ensure that the latest package was published successfully
10. Merge the PR to main and create a new Github release from the tag
    - Add the same changelog and tags from the PR to the description of the release
    - Tag any community contributors to give credit and encourage more community activity

