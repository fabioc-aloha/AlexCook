---
type: prompt
lifecycle: stable
inheritance: inheritable
description: "3-pass procedural code review: correctness, security, quality"
application: "When reviewing code changes, pull requests, or auditing specific files"
mode: agent
agent: Alex
model: claude-opus-4-6
currency: 2026-04-21
---

# /review - Code Review

3-pass review with structured findings. Create a TODO list for all passes. Mark each in-progress before starting, completed immediately after finishing.

## Step 1: Scope

1. Identify the files to review (from user input, diff, or changed files)
2. Read each file fully before reviewing

## Step 2: Pass 1 — Correctness

For each file:
1. Check logic errors, off-by-one, null/undefined paths, race conditions
2. Check error handling: are failures caught and reported?
3. Check edge cases: empty inputs, boundary values, unexpected types
4. Record findings with file, line, severity (critical/warning/info)

## Step 3: Pass 2 — Security

For each file:
1. Check OWASP Top 10: injection, broken auth, sensitive data exposure
2. Check input validation at system boundaries
3. Check credential handling: no secrets in code, no log leakage
4. Record findings with file, line, severity

## Step 4: Pass 3 — Quality

For each file:
1. Check naming clarity, function length, DRY violations
2. Check test coverage for changed logic
3. Check consistency with existing codebase patterns
4. Record findings with file, line, severity

## Summary

After all passes, generate:
- Files reviewed (count)
- Findings by severity (critical / warning / info)
- Findings by pass (correctness / security / quality)
- Top 3 issues requiring immediate attention
- Overall assessment (approve / request changes)
