---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Brain evolution governance — criteria for skill promotion, retirement, and architectural growth"
application: "When proposing new skills, instructions, or agents for promotion to master brain"
applyTo: "**/.github/skills/**,**/.github/instructions/**,**/.github/agents/**"
currency: 2026-04-22
---

# Organic Evolution Policy

The brain grows by need, not by plan. Every addition must earn its place.

## Promotion Criteria

A new brain file (skill, instruction, agent, prompt) is promoted to master when ALL of:

1. **Battle-tested**: Used successfully in 3+ independent projects or sessions
2. **Passes brain-qa**: All frontmatter fields present, currency recent, no token waste flags
3. **Fills a gap**: No existing skill/instruction covers the same domain adequately
4. **Self-contained**: No external dependencies that break portability across heirs
5. **Trifecta preferred**: Workflow skills should have matching instruction + muscle where applicable

## Retirement Criteria

Remove or archive a brain file when ANY of:

1. **Zero activations**: Never matched by applyTo in 90+ days across the fleet
2. **Superseded**: A newer, better file covers the same domain
3. **Stale beyond repair**: Currency >180 days old and content no longer accurate
4. **Token waste**: File costs more tokens than the value it delivers

## Growth Guardrails

- **No speculative additions**: Don't create skills for hypothetical future needs
- **Consolidate before splitting**: If two instructions overlap >50%, merge them
- **Instruction ≠ Skill**: Instructions are always-on behavioral rules; skills are on-demand deep knowledge. Don't duplicate content across both — the instruction should reference the skill
- **Count discipline**: When adding files, update counts in all 8+ documentation surfaces (see repo memory for locations)

## Review Cadence

- **Weekly**: brain-qa scan catches frontmatter/currency issues automatically
- **Monthly**: Manual review of activation patterns (which skills never fire?)
- **Per-release**: Audit total token cost of always-on instructions

## Lifecycle Transitions Decision Table (FM6)

Brain files move through lifecycle stages: `experimental → evolving → stable → deprecated`. Each transition has a mechanical evidence check (script-detectable) and a semantic judgment (LLM/operator decision). `external-dependent` is a terminal classification set by authoring choice, not automatic transitions.

### Transition Evidence and Criteria

| Transition | Mechanical Evidence | Semantic Judgment | Unlocks |
|-----------|-------------------|-------------------|---------|
| **experimental → evolving** | Used in 2+ sessions; passes brain-qa; no blocking findings | Content is generalizable beyond the original use case; not over-specialized | Heir sync eligibility |
| **evolving → stable** | Used in 3+ projects; currency maintained for 2+ review cycles; heir feedback is positive or neutral | Content is production-quality; no known gaps; decision tables are battle-tested | Full trust in automated dispatch |
| **stable → deprecated** | Zero activations in 90+ days; OR superseded by a newer file | Content no longer reflects current practice; successor exists and is stable | Exclusion from heir sync; candidate for archival |
| **deprecated → archived** | 30+ days in deprecated state; no activations; no heir references | No downstream consumers; safe to remove from active brain | File moved to `alex_archive/` |
| **any → experimental** | Reset: major rewrite of content (>50% changed) | Content is substantially new and needs re-validation | Resets review cycle |

### Lifecycle Transition Decision Table

| # | Check | Pass | Fail | Action on Fail |
|---|-------|------|------|----------------|
| 1 | **Evidence threshold met** — mechanical evidence criteria for the proposed transition are satisfied | All evidence signals present (session count, project count, review cycles) | Missing evidence (e.g., promoting to stable with only 1 project) | Defer promotion; document what evidence is still needed |
| 2 | **No blocking findings** — brain-qa reports no FM=0 or critical findings for this file | File passes all brain-qa checks | Frontmatter missing, currency expired, or self-contained check fails | Fix findings first; then re-evaluate transition |
| 3 | **Heir impact assessed** — for transitions that change sync eligibility, heir impact is evaluated | Sync dry-run (HS4) run; no breaking changes for heirs | Transition would break heir workflows or introduce untested content to heirs | Phase through heir sync review before transitioning |
| 4 | **Supersession chain valid** — for deprecation, the successor file is identified and at least `evolving` | `supersededBy` field points to a valid, active file | No successor identified; or successor is itself experimental | Either identify successor or keep file active |
| 5 | **No orphaned references** — files that reference the transitioning file are updated | All cross-references updated (other instructions, skills, agents, wiki) | Stale references remain pointing to deprecated/archived file | Update references before completing transition |
| 6 | **Decision logged** — transition decision recorded in PE1 decision log | `logPhase2Decision()` called with transition details + rationale | Transition applied with no audit trail | Log before changing lifecycle field |
| 7 | **Currency re-stamped** — currency date updated to reflect the transition review | Currency stamp reflects the review date, not the original authoring date | Currency left at old date after transition | Update currency as part of the transition commit |

### Demotion Triggers

These signals suggest a file should be evaluated for demotion:

| Signal | Source | Suggested Action |
|--------|--------|-----------------|
| Zero activations in 90+ days | applyTo match analysis or session logs | Evaluate for deprecation |
| Heir feedback: "confusing" or "unhelpful" | `AI-Memory/feedback/` | Evaluate for rewrite (→ experimental) or deprecation |
| Superseded by newer approach | Manual observation or knowledge synthesis | Deprecate with supersededBy |
| Token cost disproportionate to value | Token waste analysis (brain-qa) | Consolidate or deprecate |
| Contradicts established pattern | Critical thinking review | Fix (if minor) or deprecate (if fundamental) |
