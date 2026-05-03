---
type: prompt
lifecycle: stable
inheritance: inheritable
description: Fix an issue in code
mode: agent
model: claude-opus-4-6
application: When you have a known bug or error to resolve in existing code
agent: Alex
currency: 2026-04-21
---


# Fix Code

Fix the following issue:

Create a TODO list for all steps. Mark each in-progress before starting, completed immediately after finishing.



After ANY file edit, run compilation check. Do not proceed until zero errors. If compilation or tests fail, fix and retry. Maximum 5 iterations per step.

${{input}}

## Fix Format

### Issue
[Clear description of the problem]

### Root Cause
[Why the issue is happening]

### Fix
```
[Corrected code]
```

### Explanation
[Why this fix works]

### Prevention
[How to avoid this in the future]


## Summary

After completing all steps, generate:
- Files changed (with counts)
- Verifications passed (compile, test, lint)
- Issues encountered and resolutions
- Anything requiring manual attention