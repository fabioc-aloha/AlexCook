---
mode: agent
description: "3-pass code review with confidence scoring and structured feedback"
application: "Review code for correctness, security, performance, and maintainability"
tools: ["read_file", "grep_search", "semantic_search"]
---

# Code Review

Review code using the 3-Pass methodology:

## Pass 1 — Orientation

Does the approach make sense? Is the scope right?

- What is this code trying to do?
- Is this the right place for this logic?
- Does it fit the existing architecture?

## Pass 2 — Logic

Edge cases, null handling, error paths, concurrency.

- What happens with empty/null inputs?
- Are error cases handled gracefully?
- Any race conditions or state issues?
- Are assumptions validated?

## Pass 3 — Polish

Naming, duplication, test coverage, documentation.

- Are names clear and consistent?
- Is there duplicated code that could be extracted?
- Are there tests for the new/changed code?
- Are complex parts documented?

## Comment Prefixes

Use these prefixes in feedback:

| Prefix | Meaning |
|--------|---------|
| `[blocking]` | Must fix before merge |
| `[suggestion]` | Would improve, not required |
| `[question]` | Need clarification |
| `[nit]` | Minor style/preference |
| `[praise]` | Good pattern, worth noting |

## Confidence Levels

Include confidence in recommendations:

- 🔴 **HIGH** (90%+) — Certain this is an issue
- 🟠 **MEDIUM-HIGH** (70-90%) — Likely an issue
- 🟡 **MEDIUM** (50-70%) — Possible issue, verify
- 🔵 **LOW** (30-50%) — Uncertain, consider checking

Review this code:
