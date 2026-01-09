# Add Endpoint: $ARGUMENTS

Format: `{resource} {method}` (e.g., "calendars getAvailability")

1. Add request/response types to `src/models/{resource}.ts`
2. Add method to `src/resources/{resource}.ts`
3. Add tests to `tests/resources/{resource}.spec.ts`
4. Run `make test-resource NAME={resource}`
