---
type: prompt
lifecycle: stable
inheritance: inheritable
description: "Red-green-refactor TDD loop with compile and test verification at every cycle"
application: "When starting test-driven development, writing tests for new features, or enforcing TDD discipline"
mode: agent
agent: Alex
model: claude-opus-4-6
currency: 2026-04-21
---

# /tdd - Test-Driven Development

Red-green-refactor with verification at every cycle. Create a TODO list for each TDD cycle. Mark each in-progress before starting, completed immediately after finishing.

## Per-Feature TDD Cycle

Repeat this cycle for each piece of functionality:

### RED: Write Failing Test

1. Write one test that defines the expected behavior
2. Run the test -- it MUST fail (confirms test is meaningful)
3. If the test passes immediately, the behavior already exists -- skip to next feature

### GREEN: Make It Pass

1. Write the minimum code to pass the failing test
2. Run compilation check -- zero errors required
3. Run the test -- must now pass
4. If compilation or test fails: fix and retry. Maximum 5 iterations.

### REFACTOR: Improve Structure

1. Improve code structure while keeping tests green
2. Run full test suite after each refactoring move
3. If any test fails: revert the refactoring move

## When to Skip TDD

- Exploratory prototyping (write tests after design stabilizes)
- Pure configuration changes
- One-line fixes with existing test coverage

## Coverage Targets

| Range | Action |
| ----- | ------ |
| < 50% | Increase -- missing critical paths |
| 50-70% | Focus on changed code |
| 70-85% | Maintain, don't chase |

## Summary

After completing all TDD cycles, generate:
- Features implemented (list)
- Tests written (count, all passing)
- Compilation status (clean)
- Coverage delta (if measurable)
- Any cycles where RED or GREEN required retries
