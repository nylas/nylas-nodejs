# Add Resource: $ARGUMENTS

1. Create `src/models/{name}.ts` with interfaces
2. Create `src/resources/{name}.ts` extending Resource
3. Register in `src/nylas.ts`
4. Create `tests/resources/{name}.spec.ts`
5. Run `make ci`

Use templates in `.claude/shared/` as reference.
