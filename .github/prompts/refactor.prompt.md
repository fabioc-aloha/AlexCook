---
type: prompt
lifecycle: stable
inheritance: inheritable
description: "Procedural refactoring with test parity verification at every step"
application: "When restructuring code for clarity, performance, or maintainability without changing behavior"
mode: agent
agent: Alex
model: claude-opus-4-6
currency: 2026-04-21
---

# /refactor - Safe Refactoring

Same behavior, better structure. Create a TODO list for all steps. Mark each in-progress before starting, completed immediately after finishing.

## Step 1: Baseline

1. Run the test suite and record pass/fail counts as baseline
2. If no tests exist for the target code, write them first -- verify they pass

## Step 2: Identify Smells

| Smell | Fix |
| ----- | --- |
| Function >60 lines | Extract Function |
| File >1,500 lines | Extract Module |
| Duplicate code | Extract shared function |
| Deep nesting | Guard clauses / early return |
| Long parameter list | Parameter Object |

## Step 3: Refactor (One Move at a Time)

For each refactoring move:
1. Apply the change
2. Run compilation check -- zero errors required
3. Run tests -- compare against baseline (same count, same pass/fail)
4. If tests fail: revert the change and report what went wrong

Maximum 5 compile-fix iterations per move. If still failing, stop and report.

## Step 4: Verify Parity

1. Run full test suite one final time
2. Confirm test count and pass rate match baseline exactly
3. If any test failures were introduced, revert and report

## Summary

After completing all moves, generate:
- Refactoring moves applied (with file and line references)
- Test parity confirmed (baseline vs final counts)
- Compilation status (clean)
- Any moves that were reverted and why

