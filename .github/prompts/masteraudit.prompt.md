---
type: prompt
lifecycle: stable
inheritance: inheritable
description: "Multi-phase automated brain audit using existing audit scripts"
application: "When auditing brain health, architecture consistency, or running comprehensive quality checks"
mode: agent
agent: Alex
model: claude-opus-4-6
currency: 2026-04-21
---

# /masteraudit - Master Brain Audit

Multi-phase automated sweep of brain health. Create a TODO list for all phases. Mark each in-progress before starting, completed immediately after finishing.

## Phase 1: Architecture Audit

1. Run `node scripts/audit-architecture.cjs`
2. Capture output and record any issues found
3. If critical issues: stop and report before continuing

## Phase 2: Heir Sync Drift

1. Run `node scripts/audit-heir-sync-drift.cjs`
2. Record any files out of sync between master and heir
3. Note which files need re-sync

## Phase 3: Skill Activation Index

1. Run `node scripts/audit-skill-activation-index.cjs`
2. Record orphaned skills, missing activation entries
3. Note skills needing registration

## Phase 4: Tools and Hooks

1. Run `node scripts/audit-tools-hooks.cjs`
2. Record broken tool references, missing hook handlers
3. Note tools/hooks needing repair

## Phase 5: Brain QA

1. Run `node .github/muscles/brain-qa.cjs`
2. Record pass/fail counts, broken connections, count drift
3. This is the authoritative health score

## Phase 6: Self-Contained Check

1. Run `node scripts/check-self-contained.cjs`
2. Record any external dependencies that should be internalized

## Summary

After all phases, generate:
- Phases completed (count)
- Issues by severity (critical / warning / info)
- Issues by phase (architecture / sync / skills / tools / qa / self-contained)
- Top 5 issues requiring immediate attention
- Overall brain health score (from brain-qa)
