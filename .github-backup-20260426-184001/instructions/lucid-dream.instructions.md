---
applyTo: "**/*lucid*,**/*dual-mode*"
description: "Hybrid dream-meditation protocol — conscious decisions during automated processing"
application: "When dream diagnostics surface issues requiring human judgment"
---

# Lucid Dream Protocol

Bridge between automated dream scanning and conscious meditation. Activates when dream findings require judgment calls that pure automation cannot make.

## When Lucid Dream Activates

| Trigger | Example |
|---------|---------|
| Ambiguous findings | Two skills with overlapping `applyTo` — which to consolidate? |
| Structural changes needed | Skill should be split or merged — architecture decision |
| Content quality flags | Skill detected as shallow — needs domain enrichment |
| Cross-domain connections | Pattern spans multiple skills — needs human synthesis |

## Two-Phase Execution

### Phase 1 — Unconscious (Automated)

Run dream protocol normally. Collect all findings.

```bash
# Run brain-qa to generate findings for lucid review
node .github/muscles/brain-qa.cjs
# Review the priority queue for items requiring judgment
head -60 .github/quality/brain-health-grid.md
```

### Phase 2 — Conscious (Interactive)

For each finding requiring judgment:

1. Present the issue with context (what dream found, why it's ambiguous)
2. Show options with trade-offs
3. Implement the chosen resolution
4. Validate the fix didn't break other connections

## Decision Categories

| Category | Automated (Dream) | Requires Judgment (Lucid) |
|----------|--------------------|---------------------------|
| Broken link | Auto-repair via mapping | Keep if intentional |
| Missing frontmatter | Flag as error | Determine correct values |
| Shallow skill | Flag for enrichment | Decide depth vs. removal |
| Overlapping skills | Flag overlap | Merge, split, or differentiate |
| Version drift | Report discrepancy | Decide which version is canonical |

## Completion

A lucid dream is complete when all dream findings are either:

- Resolved (fix applied and validated)
- Deferred with rationale (logged for next session)
- Dismissed with justification (false positive documented)
