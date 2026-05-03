---
description: "Scientific method for debugging — observe, hypothesize, experiment, conclude"
application: "When investigating build failures, test errors, runtime crashes, or unexpected behavior through systematic reproduction"
applyTo: "**/*debug*,**/*bug*,**/*error*,**/*fix*"
---

# Hypothesis-Driven Debugging

Apply the scientific method to debugging rather than trial-and-error.

## Core Protocol

1. **Observe** — Reproduce the failure. Capture exact error, stack trace, and conditions
2. **Hypothesize** — Form multiple competing hypotheses (minimum 2). Rank by likelihood
3. **Experiment** — Design a minimal test that distinguishes between hypotheses
4. **Conclude** — Accept or reject each hypothesis based on evidence
5. **Verify** — Re-run builds and tests after every change

## Key Rules

- Never change more than one variable at a time
- Always re-run the full test suite after a fix, not just the failing test
- Document what you ruled out, not just what you found
- If a hypothesis survives 3 experiments, it's likely correct
- If all hypotheses fail, step back and re-observe with fresh eyes

## Skill Reference

Full methodology in `.github/skills/hypothesis-driven-debugging/SKILL.md`.
