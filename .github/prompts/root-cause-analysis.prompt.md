---
type: prompt
lifecycle: stable
inheritance: inheritable
description: Investigate a bug or failure using systematic root cause analysis
mode: agent
model: claude-opus-4-6
application: "When debugging issues, investigating failures, or root cause analysis"
agent: Alex
currency: 2026-04-21
---

# /rca - Root Cause Analysis


Find the true source, not symptoms — systematic investigation from observation to permanent fix.

Create a TODO list for all steps. Mark each in-progress before starting, completed immediately after finishing.



After ANY file edit, run compilation check. Do not proceed until zero errors. If compilation or tests fail, fix and retry. Maximum 5 iterations per step.

## Process

1. **Reproduce** — Can you trigger the issue consistently?
2. **Isolate** — What's the smallest failing case?
3. **5 Whys** — Dig past symptoms to the system-level cause
4. **Categorize** — Code, data, infra, dependency, config, or process?
5. **Fix + Test** — Write a test that captures the root cause, then fix
6. **Prevent** — Add automation to catch this class of issue

## Start

Describe the bug, error, or failure you're investigating. Include:
- What happened (symptoms)
- When it started (context)
- What you've already tried



## Summary

After completing all steps, generate:
- Files changed (with counts)
- Verifications passed (compile, test, lint)
- Issues encountered and resolutions
- Anything requiring manual attention