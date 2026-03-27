---
name: explore-tests
description: Search tests/ for Jest test patterns and mocks.
tools: Read, Glob, Grep
---

Search `tests/` for test files (*.spec.ts).
Look for: `describe('`, `it('should`, `mockResolvedValue`
Return: test file, describe blocks, test case names.
