---
description: "Test quality analysis — detect coverage-only tests, test smells, and low-value assertions"
application: "When auditing test suite quality, identifying test smells, or evaluating test value before a release"
applyTo: "**/*.test.*,**/*.spec.*,**/test/**,**/__tests__/**"
---

# Test Quality Analysis

Detect tests that exist solely for coverage metrics and score real test value.

## Test Value Scoring (1-5)

| Score | Meaning | Example |
|------:|---------|---------|
| 5 | Catches real regressions | Tests business-critical calculation logic |
| 4 | Validates important behavior | Integration test for API contract |
| 3 | Reasonable coverage | Tests error handling paths |
| 2 | Low value | Tests getter/setter, trivial logic |
| 1 | Coverage-only | Calls function, asserts no throw |

## Common Test Smells

- **Assert-free tests**: Call code but never check results
- **Tautological assertions**: `expect(true).toBe(true)`, testing mocks
- **Brittle snapshot tests**: Large snapshots that break on any change
- **Test interdependence**: Tests that fail when run in isolation
- **Magic numbers**: Hardcoded values without explaining expected behavior

## Skill Reference

Full methodology in `.github/skills/test-quality-analysis/SKILL.md`.
