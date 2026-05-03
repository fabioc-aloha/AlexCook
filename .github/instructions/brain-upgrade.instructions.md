---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Two-phase brain upgrade — mechanical install (Phase 1) followed by semantic LLM reconciliation (Phase 2)"
application: "After a brain upgrade via fleet script, VS Code extension, or muscle — whenever .github-backup-* exists"
applyTo: "**/*upgrade*,**/*curat*,**/*backup*,**/*finalize*,**/*brain-upgrade*"
currency: 2026-04-23
---

# Brain Upgrade

Two-phase procedure. **Phase 1 is mechanical (same contract, three executors). Phase 2 is semantic and LLM-led.** The trifecta owns both sides: the shared core backs Phase 1, this skill+instruction drive Phase 2.

## Activation

Activate when a `.github-backup-*` directory exists in a project root after a brain upgrade. Full procedure in [.github/skills/brain-upgrade/SKILL.md](../skills/brain-upgrade/SKILL.md). Mechanical helpers in [.github/muscles/brain-upgrade.cjs](../muscles/brain-upgrade.cjs).

## Three Executors, One Phase 1 Contract

| Executor | Where | When |
|---|---|---|
| Fleet orchestrator | `scripts/upgrade-brain.cjs` | Master-only, iterates `C:\Development\*` |
| VS Code extension | `heir/platforms/vscode-extension/src/bootstrap.ts` | Cockpit — install/upgrade on the open workspace |
| LLM-callable muscle | [.github/muscles/brain-upgrade.cjs](../muscles/brain-upgrade.cjs) (`--mode Upgrade`) | Single project, invoked by the LLM via this skill |

All three import the **same** Phase 1 contract from the shared core:

```text
.github/muscles/shared/brain-upgrade-core.cjs
```

The extension is TypeScript and mirrors the contract rather than importing, but must satisfy the same guarantees.

## Two-Phase Model

| Phase | Owner | Scope |
|-------|-------|-------|
| **Phase 1 — Mechanical** | Shared core (three executors) | Eligibility gate, backup, fresh install, version stamp, additive settings merge, auto-preserve heir-managed files, auto-restore non-brain content |
| **Phase 2 — Semantic** | This trifecta (LLM-led, muscle-assisted) | `copilot-instructions.md` reconciliation, non-standard content review, semantic verification, final cleanup with user consent |

## Phase 1: Mechanical Guarantees

Before Phase 2 runs, the executor MUST have:

- Skipped repos without a `.github` folder (not an Alex repo)
- Skipped repos whose `.github` contents don't match a recognized Alex brain (v8 `brain-version.json` with Alex architecture, or legacy CI pattern)
- Skipped locked/protected projects before any filesystem mutation
- Renamed current `.github` → `.github-backup-YYYYMMDD-HHMMSS` (never delete)
- **Installed the fresh brain on disk, including the fresh trifecta** — this is the known hand-off point for Phase 2
- Preserved heir-managed files from backup: `NORTH-STAR.md`, `config/loop-menu.json`, `config/taglines.json`, `config/cognitive-config.json`, `config/markdown-light.css`
- Preserved `brain-version.json` fields: `identity`, `upgradeLock`, `lockReason`
- Additive `.vscode/settings.json` merge: user customization wins, new defaults fill gaps only

If any of these are not true, Phase 2 must flag the gap and not proceed with destructive actions.

## Phase 2: Semantic Responsibilities (LLM)

Phase 2 runs **from the freshly-installed trifecta**, not from anything in the backup. When activated, the LLM must:

1. **Detect backup** — confirm `.github-backup-*` exists and is from a recent upgrade
2. **Run muscle scan** — `node .github/muscles/brain-upgrade.cjs --mode Scan` to inventory what the mechanical phase left for review
3. **Reconcile `copilot-instructions.md`** — diff `copilot-instructions.backup.md` vs. fresh template; merge project identity, context, tech stack, and coding standards into the new template. Additive only.
4. **Review non-standard content** — for each item the muscle reports under ROOT_FILE / UNKNOWN_DIR, decide copy-forward vs. skip, applying the Curation Categories in the skill
5. **Semantic verification** — confirm the resulting heir is an Alex brain, has its customizations intact, loads skills/instructions, and nothing project-specific was lost
6. **Summarize for user** — list what was preserved, what was merged, what needs human review, and explicitly ask before cleaning up backups

## Trifecta Protection

During Phase 2, these files are **protected — never restored from backup**:

- `.github/skills/brain-upgrade/SKILL.md`
- `.github/instructions/brain-upgrade.instructions.md`
- `.github/muscles/brain-upgrade.cjs`
- `.github/muscles/shared/brain-upgrade-core.cjs`

An old trifecta silently overwriting a new one is the worst possible failure mode (self-downgrade of the upgrader). The muscle's AutoRestore refuses these paths by list. The LLM must also never copy these from a backup during judgment-driven curation, even if the backup content appears "richer."

## Muscle Modes

The muscle supports both phases. Phase 1 modes operate on a single project (default: `--project-dir` = cwd). Phase 2 modes operate fleet-wide (default: `--target-dir` = `C:\Development`), narrow with `--include`.

### Phase 1 (mechanical)

| Mode | Command | Purpose |
|------|---------|---------|
| Audit | `--mode Audit [--project-dir <path>]` | Is this a recognized Alex brain? Locked? |
| Upgrade | `--mode Upgrade --brain-source <path> [--project-dir <path>] [--dry-run]` | Per-project Phase 1 via shared core |
| Verify | `--mode Verify --brain-source <path> [--project-dir <path>]` | Verify brain integrity against source |
| Rollback | `--mode Rollback [--project-dir <path>] [--dry-run]` | Restore from most recent `.github-backup-*` |

### Phase 2 (semantic helpers)

| Mode | Command | Role |
|------|---------|------|
| Scan | `--mode Scan` | Inventory backup findings for the LLM |
| AutoRestore | `--mode AutoRestore [--dry-run]` | Move safe copy-forward content (skips protected trifecta paths) |
| Curate | `--mode Curate --include "name"` | Interactive CI merge helper |
| Clean | `--mode Clean --include "name"` | Remove backup — **only after explicit user consent** |

## Hard Rules

- A repo without `.github` is NOT an Alex repo. Never upgrade it.
- Locked/protected brains MUST be skipped before any rename.
- Backups are NEVER deleted automatically. Ask the user.
- `.vscode/settings.json` merges are additive — user values win over defaults.
- CI merging is additive — merge project identity into the new template, don't replace it.
- Protected trifecta paths are NEVER restored from backup, by muscle or by LLM.
- When in doubt, keep the backup. Disk is cheap; lost customization isn't.

