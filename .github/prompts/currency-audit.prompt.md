---
type: prompt
lifecycle: stable
inheritance: inheritable
description: Run a currency audit — full assessment (freshness + semantic consistency) before stamping dates
mode: agent
model: claude-opus-4-6
application: "When brain-qa shows expired currency dates or when performing scheduled maintenance"
agent: Brain Ops
currency: 2026-04-21
---

# /currency-audit — Brain File Full Assessment

Full review of brain files — external freshness AND internal consistency — stamp only after all checks pass.

Create a TODO list for all steps. Mark each in-progress before starting, completed immediately after finishing.



After ANY file edit, run compilation check. Do not proceed until zero errors. If compilation or tests fail, fix and retry. Maximum 5 iterations per step.

## Workflow

1. **Generate grid**: Run `node .github/muscles/brain-qa.cjs` and read the Priority Queue
2. **Select batch**: Pick the top 10-15 files from the Priority Queue
3. **Per-file review**: For each file, apply the currency-audit skill checklist:
   - Frontmatter completeness
   - Content freshness (APIs, versions, URLs, best practices)
   - **Semantic consistency** (terminology, claims match reality, cross-refs, no contradictions, process logic)
   - Structural quality (token waste, progressive disclosure)
   - Inheritance correctness (master-only vs inheritable)
4. **Fix and stamp**: Fix ALL issues, then stamp `currency:` to today — partial review does not earn a stamp
5. **Verify**: Re-run brain-qa, confirm all reviewed files pass
6. **Report**: Summarize what was updated and any findings worth noting


## Summary

After completing all steps, generate:
- Files changed (with counts)
- Verifications passed (compile, test, lint)
- Issues encountered and resolutions
- Anything requiring manual attention