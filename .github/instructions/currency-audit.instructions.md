---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Comprehensive brain file review — external freshness, internal consistency, semantic accuracy — stamp only after full assessment"
application: "When performing currency audits, reviewing brain file freshness, or updating stale content"
applyTo: "**/.github/quality/*,**/*currency*,**/*audit*,**/*brain-qa*"
currency: 2026-04-20
---

# Currency Audit

Skill: `.github/skills/currency-audit/SKILL.md` — full checklist and type-specific guidance.

## Quick Protocol

1. Run `node .github/muscles/brain-qa.cjs` — read Priority Queue
2. For each file: frontmatter → content freshness → **semantic consistency** → structural → inheritance
3. Fix all issues (stale content, wrong terms, broken refs, contradictions)
4. **Stamp `currency: YYYY-MM-DD` only after ALL checks pass** — partial review does not earn a stamp
5. Re-run brain-qa to verify pass

## Key Rules

- **Critical thinking governs every check** — verify correctness, don't assume plausibility. Apply: alternative hypotheses, evidence quality, self-report skepticism, materiality gate
- Batch 10-15 files per session to maintain review quality
- Group by domain so research carries across files
- `currency` date means "fully assessed — fresh AND semantically consistent" — not "file was touched"
- Semantic checks: terminology current, claims match reality, cross-refs valid, no contradictions, process logic sound
- `inh=1` files must not leak master-only content to heirs
