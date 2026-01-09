# SDK Templates

## Placeholders
Replace in templates:
- `{{ResourceName}}` = PascalCase (e.g., `Widget`)
- `{{resourceName}}` = camelCase (e.g., `widget`)

## Templates
- `model-template.ts` → `src/models/{name}.ts`
- `resource-template.ts` → `src/resources/{name}.ts`
- `test-template.spec.ts` → `tests/resources/{name}.spec.ts`

See `.claude/docs/adding-resources.md` for full guide.
