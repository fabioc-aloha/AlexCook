---
description: "Systematic technical debt discovery, inventory, and prioritization"
application: "When auditing codebase health, finding code smells, or planning cleanup sprints"
applyTo: "**/*debt*,**/*TODO*,**/*FIXME*,**/*smell*"
---

# Tech Debt Discovery

Systematically discover, inventory, and prioritize technical debt for actionable cleanup.

## Discovery Sources

- **Code markers**: TODO, FIXME, HACK, XXX, DEPRECATED comments
- **Git history**: Files with highest churn (changes/month), hotspot coupling
- **Dependencies**: Outdated packages, known CVEs, deprecated APIs
- **Complexity**: Cyclomatic complexity, deeply nested logic, large files
- **Test gaps**: Uncovered critical paths, flaky tests, missing integration tests

## Prioritization Framework

Score each debt item on:

1. **Impact** (1-5): How much does it slow development or risk production?
2. **Effort** (1-5): How much work to fix?
3. **Urgency** (1-5): Is it getting worse over time?

Priority = (Impact x Urgency) / Effort

## Skill Reference

Full methodology in `.github/skills/tech-debt-discovery/SKILL.md`.
