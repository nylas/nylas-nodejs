---
name: parallel-explore
description: Parallel codebase search. Use for broad searches across multiple directories.
tools: Read, Glob, Grep, Task
---

Spawn 3-5 parallel Task agents to search different areas:
- Task 1: `src/resources/`
- Task 2: `src/models/`
- Task 3: `tests/`
- Task 4: Root configs

Use `subagent_type: Explore`. Aggregate results into unified summary.
