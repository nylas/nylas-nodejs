# Nylas Node.js SDK

## Quick Start

```bash
make help     # See all commands
make ci       # Full CI (lint, format, test)
make test     # Run tests
make build    # Build SDK
```

## Automation (Hands-Free)

**Auto-formatting**: Code is automatically formatted with Prettier + ESLint after every edit.

**Pre-allowed tools**: Most operations run without permission prompts.

**Git safety**: Claude handles code, you handle commits.

## Architecture

- **Entry**: `src/nylas.ts` - Nylas class with APIClient
- **Resources**: `src/resources/` - Extend `resource.ts` with `_list`, `_find`, `_create`, `_update`, `_destroy`
- **Models**: `src/models/` - TypeScript interfaces for API objects
- **Build output**: `lib/esm/`, `lib/cjs/`, `lib/types/`

## Git Workflow

Claude handles:
- Writing code, running tests, fixing issues
- `git status`, `git diff`, `git log`

**You handle** (for review control):
- `git add`, `git commit`, `git push`

## Protected Files

Auto-generated (don't edit manually):
- `src/version.ts` - Run `make build`
- `src/models/index.ts` - Run `make build`

Secrets (blocked):
- `.env*` files

## Code Quality Rules

**New file limit**: 500 lines max. Split large files into smaller modules.

*Note: This applies to new files only, not existing files.*

## Adding New Resources

1. Copy templates from `.claude/shared/`
2. Register in `src/nylas.ts`
3. Run `make ci`

See `.claude/docs/adding-resources.md` for details.

## Slash Commands

| Command | Action |
|---------|--------|
| `/project:test` | Run tests |
| `/project:build` | Build SDK |
| `/project:fix` | Auto-fix lint issues |
| `/project:explore {query}` | Parallel codebase search |
| `/project:add-resource {name}` | Scaffold new resource |
| `/project:review` | Review code changes |

## Detailed Guides

| Guide | Path |
|-------|------|
| Architecture | `.claude/docs/architecture.md` |
| Adding Resources | `.claude/docs/adding-resources.md` |
| Testing | `.claude/docs/testing-guide.md` |
