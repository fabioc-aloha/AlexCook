---
type: prompt
lifecycle: stable
inheritance: inheritable
description: "Procedural debugging: reproduce, isolate, fix, verify with test gates"
application: "When investigating build failures, test errors, runtime crashes, or unexpected behavior"
mode: agent
agent: Alex
model: claude-opus-4-6
currency: 2026-04-21
---

# /debug - Systematic Debugging

Reproduce, isolate, fix, verify. Create a TODO list for all steps. Mark each in-progress before starting, completed immediately after finishing.

## Step 1: Reproduce

1. Confirm the error exists -- run the failing command or test
2. Capture the exact error output (stack trace, error code, message)
3. If not reproducible, gather more context before proceeding

## Step 2: Isolate

1. Narrow to the specific file, function, and line
2. Read the error stack trace top-down for cause, bottom-up for context
3. Check recent changes that may have introduced the issue

## Step 3: Hypothesize

1. Form one theory about the root cause with supporting evidence
2. If multiple theories, rank by likelihood and test highest first

## Step 4: Fix

1. Apply the minimal change that addresses the root cause
2. Run compilation check -- zero errors required
3. If compilation fails: fix and retry. Maximum 5 iterations.

## Step 5: Verify

1. Re-run the original failing command/test -- must now pass
2. Run the full test suite -- zero regressions allowed
3. If new failures appear: diagnose whether the fix caused them

## Summary

After fix is verified, generate:
- Root cause (one sentence)
- Fix applied (file, line, what changed)
- Verifications passed (compile, specific test, full suite)
- Regression test added (yes/no)

