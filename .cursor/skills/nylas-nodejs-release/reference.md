# nylas-nodejs release — reference

## Prerequisites (maintainer machine)

- **npm**: Account with **publish** rights to the `nylas` package on npm.
- Configure credentials with **`npm login`** on the machine used to publish. Do not commit tokens, session strings, or `.npmrc` secrets to the repository.
- Obtain credentials through your **organization’s approved** credential process (e.g. team password manager). Never paste secrets into chat or commit them.

## Canary releases

```bash
npm publish --tag canary
```

### Promote a canary to latest

```bash
npm dist-tag add nylas@X.Y.Z latest
```

Replace `X.Y.Z` with the published version.

### Verify on npm

Open https://www.npmjs.com/package/nylas and confirm **latest** (or **canary**) matches the intended version.

## GitHub Release notes

Mirror the **merged PR description**: same changelog text, PR/issue/commit references, and contributor credits as in the PR.

## Version script behavior

`npm version` runs the `version` script in `package.json`, which refreshes `src/version.ts` via `scripts/exportVersion.js` for the SDK User-Agent string.

## Safety

- Confirm **no test files** under `src/` before build/publish if that would ship unwanted files.
- Prefer **explicit push** of the release tag rather than pushing all local tags.
