---
mode: agent
description: "Systematic debugging — reproduce, isolate, hypothesize, fix, verify"
application: "Debug errors, crashes, test failures, and unexpected behavior"
tools: ["read_file", "grep_search", "run_in_terminal", "semantic_search"]
---

# Debug

Systematic debugging: Reproduce → Isolate → Hypothesize → Fix → Verify.

## The Process

### 1. Reproduce

Can you trigger the error consistently?

- What are the exact steps?
- Does it happen every time or intermittently?
- What's the environment? (OS, versions, config)

### 2. Read the Error

Stack traces contain vital information:

- **Top-down**: Find the immediate cause (first frame in your code)
- **Bottom-up**: Understand the context (what triggered the chain)
- **Error message**: Often tells you exactly what's wrong

### 3. Isolate

What's the smallest failing case?

- Can you reproduce in a test?
- What happens if you comment out parts?
- Binary search: which half contains the bug?

### 4. Hypothesize

One theory at a time:

- State your hypothesis clearly
- Design a test that would prove/disprove it
- If disproven, move to next hypothesis
- Don't fix multiple things at once

### 5. Fix

Minimal change:

- Fix the root cause, not the symptom
- Avoid "while I'm here" changes
- Run tests after the fix

### 6. Verify

Confirm the fix:

- Does the original reproduction now work?
- Did you add a regression test?
- Is the full test suite still green?

## Common Debugging Techniques

| Technique | When to Use |
|-----------|-------------|
| `console.log` / `print` | Quick state inspection |
| Debugger breakpoints | Step through execution |
| Binary search | Large codebase, unclear location |
| Git bisect | "It worked before" |
| Rubber duck | Explaining reveals assumptions |

Share the error, stack trace, or unexpected behavior:
