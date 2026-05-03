---
mode: agent
description: "Safe refactoring — same behavior, better structure"
application: "Restructure code while preserving behavior with test verification"
tools: ["read_file", "replace_string_in_file", "grep_search", "run_in_terminal"]
---

# Refactor

Guide a safe refactoring session — same behavior, better structure.

## Approach

1. **Identify the smell** — What's wrong with the current structure?
2. **Verify test coverage** — Do tests exist? If not, write them first.
3. **One move at a time** — Extract, rename, move. Test between each.
4. **Commit checkpoints** — Each step is independently revertible.

## Common Code Smells and Fixes

| Smell | Fix |
|-------|-----|
| Function >60 lines | Extract Function |
| File >1,500 lines | Extract Module |
| Duplicate code | Extract shared function |
| Deep nesting (>4 levels) | Guard clauses / early return |
| Long parameter list (>4) | Parameter Object |
| Feature envy | Move method to the class it envies |
| God class | Split responsibilities |
| Primitive obsession | Introduce value objects |

## Safe Refactoring Workflow

```
1. Run tests (ensure green baseline)
2. Make ONE structural change
3. Run tests (verify still green)
4. Commit with descriptive message
5. Repeat until clean
```

## Warning Signs

Stop and reconsider if:

- Tests start failing (revert, understand why)
- Change scope is growing (split into smaller PRs)
- You're changing behavior (that's not refactoring)

What would you like to refactor?
