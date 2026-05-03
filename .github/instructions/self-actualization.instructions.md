---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Self-actualization cognitive skill for comprehensive architecture assessment and deep meditation"
application: "Monthly cadence (D9: 30-day staleness threshold), or on-demand when architecture feels off"
applyTo: "**/*actuali*,**/*assessment*,**/*self-assess*"
currency: 2026-04-26
---

# Self-Actualization — Auto-Loaded Rules

Self-actualization is the **deep monthly meditation** — a 6-dimension architecture assessment that produces a chronicle and a prioritized improvement plan.

## When to invoke

| Trigger | Action |
|---|---|
| `session-start` warns "Self-actualization stale" (≥ 30 days) | Run `/self-actualize` this session if time allows |
| User asks "how is the architecture?" / "should we restructure?" | Recommend `/self-actualize` rather than ad-hoc inspection |
| After a major release / version bump | Optional but useful — captures growth trajectory baseline |
| `< 30 days` since last chronicle | Suggest `/meditate` instead — self-actualization is the monthly variant |

## Mechanics (Path B, v8.4.0)

1. Inputs come from `.github/muscles/self-actualization-snapshot.cjs` (mechanical counts, samples, growth diff)
2. Dream report is an **optional** structural baseline (D8) — if missing, dimension 1 is N/A and a `/dream` is recommended but not required
3. LLM judges dimension 3 (Knowledge Depth) by reading the deterministic skill sample
4. Chronicle goes to `.github/episodic/self-actualization-YYYY-MM-DD.md`
5. Set `cogConfig.lastSelfActualization` after writing the chronicle (D12 — heir-compat fallback; the snapshot uses the chronicle filename as truth)
6. Snapshot is gitignored (D13) — regenerate freely

## Anti-patterns

- Running self-actualization without the snapshot — leads to subjective "feels healthy" assessments
- Skipping the chronicle — without a written record, growth diff is impossible next month
- Treating dream-unavailable as a blocker — it's optional per D8; do dims 2/3/4/6 and mark 1/5 as deferred

Full protocol and dimension rubric in `.github/skills/self-actualization/SKILL.md`.
Orchestration prompt: `.github/prompts/self-actualize.prompt.md`.
