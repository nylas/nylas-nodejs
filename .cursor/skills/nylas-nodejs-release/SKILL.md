---
name: nylas-nodejs-release
description: >-
  Prepares nylas-nodejs SDK releases on a versioned release branch with CHANGELOG
  updates, version bump, git tag, and PR body. Stops for the maintainer to run
  npm publish, then after confirmation creates the GitHub Release from the tag.
  Use when the user wants to ship a new SDK version, cut a release branch, update
  CHANGELOG.md, npm version, tag, open a release PR, publish to npm, or create a
  GitHub Release.
---

# nylas-nodejs SDK release

Automate **everything up to npm publish** and **GitHub Release creation after merge**, with explicit **human checkpoints** for publishing and confirmation.

## Principles

- **Never** commit or paste npm tokens, `.npmrc` secrets, or session credentials. Publishing uses `npm login` on the maintainer’s machine only.
- **Release branch name**: `vX.Y.Z-release` (example: `v8.0.5-release`).
- **CHANGELOG** follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) at repo root: `CHANGELOG.md`.
- **Traceability**: Each changelog line should reference the relevant **PR**, **commit(s)**, and **closed issues** where applicable (see PR description template below).

## When the user starts a release

Ask for (if not already given):

1. Target **semver** `X.Y.Z` (no leading `v` in the version number for `package.json`).
2. **Release date** for the changelog (ISO-style: `YYYY-MM-DD`).
3. Whether this is **latest** or **canary** (see [reference.md](reference.md) for canary/dist-tag).

---

## Phase 1 — Branch and changelog (agent)

1. Ensure work is based on **`main`** with intended changes already merged (or document what is included).
2. Create and checkout **`vX.Y.Z-release`** from `main`:
   - `git fetch origin main && git checkout -b vX.Y.Z-release origin/main`
3. **CHANGELOG.md**:
   - If there is an `## [Unreleased]` section: rename it to `## [X.Y.Z] - YYYY-MM-DD` and fill sections (**Added** / **Changed** / **Fixed** / **Breaking change**, etc.).
   - If there is no Unreleased section: add a new top section after the intro paragraphs:
     - `## [X.Y.Z] - YYYY-MM-DD`
   - Match existing style (see recent entries in `CHANGELOG.md`).
   - For each bullet, include PR/issue links like `([#NNN](https://github.com/nylas/nylas-nodejs/pull/NNN))` where possible.
4. Commit: `chore(release): prepare vX.Y.Z` (or team convention).
5. Push the branch: `git push -u origin vX.Y.Z-release`.

**Stop and show** the user: branch name, diff summary, and the new changelog section.

---

## Phase 2 — Version, tag, PR (agent; user may need to run commands locally)

1. **Pre-flight before `npm run build` / publish**: Confirm there are **no test files** under `src/` that would ship in the package (team rule).
2. Run **`npm version X.Y.Z`** (semver only; no `v` prefix in the command argument).
   - This bumps `package.json`, runs the `version` lifecycle script (`export-version` updates `src/version.ts` for the User-Agent), creates a **commit**, and a **git tag** `vX.Y.Z` (default npm tag prefix).
3. Push branch and tags:
   - `git push origin vX.Y.Z-release`
   - `git push origin vX.Y.Z` (or `git push origin --tags` if that is the team norm—prefer pushing the explicit tag to avoid stray tags).

**Open a PR** `vX.Y.Z-release` → `main` with this **description template**:

```markdown
## Release vX.Y.Z (YYYY-MM-DD)

### Changelog

[Paste the full `## [X.Y.Z] - YYYY-MM-DD` section from CHANGELOG.md]

### References

For each line above, link the implementing commits and closed issues (example pattern):

- **Summary of the change** — commit `abc1234` / PR #123 / closes #456 …

(Add community / contributor credits if applicable.)
```

Ask the user to wait for **CI green** on the PR.

4. After CI passes, run **`npm run build`** on the release branch to validate the artifact locally.

**Checkpoint — npm publish (maintainer only)**  
Tell the user clearly:

- Publishing requires **npm credentials** with publish rights, configured via **`npm login`** on their machine (see [reference.md](reference.md) for prerequisites). Do not store secrets in the repo.
- They should run **`npm publish`** (or **`npm publish --tag canary`** for canary) from the clean release branch **after** CI passes and build is verified.
- They should verify the package on npm when done.

**Wait** until the user explicitly confirms both:

1. **npm**: “The package is published (and dist-tag is correct).”
2. **Git**: “The release PR is merged to `main`.”

Do **not** create the GitHub Release until both are confirmed.

---

## Phase 3 — GitHub Release (agent, after confirmation)

Only after the user confirms **published + PR merged**:

1. Ensure local `main` is up to date: `git fetch origin main && git checkout main && git pull origin main`.
2. Verify tag `vX.Y.Z` exists on the remote (merged release flow should have the tag from `npm version`; if not, stop and ask).
3. Create the GitHub Release **from tag `vX.Y.Z`** with:
   - **Title**: `vX.Y.Z` (or `nylas vX.Y.Z` to match past releases).
   - **Body**: Same changelog content and PR/issue/commit references as the merged PR; tag community contributors for credit when applicable.

Prefer the **`gh` CLI** when available:

```bash
gh release create "vX.Y.Z" --title "vX.Y.Z" --notes-file - <<'EOF'
<Paste release notes; same as PR/changelog>
EOF
```

If `gh` is not available, give exact **GitHub UI** steps: Repository → Releases → Draft a new release → choose tag `vX.Y.Z` → paste notes.

---

## Copy-paste checklist

Track progress in the chat:

```text
Phase 1 — Prep
- [ ] Branch vX.Y.Z-release from main
- [ ] CHANGELOG [X.Y.Z] section complete with links
- [ ] Pushed branch

Phase 2 — Version & PR
- [ ] No stray tests under src/
- [ ] npm version X.Y.Z (version.ts + tag)
- [ ] Pushed branch + tag
- [ ] PR opened with changelog + references
- [ ] CI green; npm run build OK
- [ ] User ran npm publish (or canary)
- [ ] User confirmed published + PR merged

Phase 3 — GitHub
- [ ] gh release create (or UI) from vX.Y.Z with full notes
```

---

## Additional topics

- Canary releases, promoting `latest`, and verifying npm: [reference.md](reference.md)
- Example release PR style: https://github.com/nylas/nylas-nodejs/pull/590
