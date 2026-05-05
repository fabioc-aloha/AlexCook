---
type: skill
lifecycle: stable
inheritance: inheritable
name: brain-upgrade
description: "Two-phase brain upgrade — mechanical install via shared core, then LLM-led semantic reconciliation"
tier: standard
applyTo: '**/*upgrade*,**/*curat*,**/*backup*,**/*finalize*,**/*brain-upgrade*'
currency: 2026-04-23
---

# Brain Upgrade

> Three executors, one mechanical contract, one LLM-led semantic reconciliation

An Alex brain upgrade is intentionally split into two phases. Phase 1 is mechanical and deterministic — the same contract implemented by three executors. Phase 2 is semantic — driven by the LLM through this skill, using the muscle as a mechanical assistant.

---

## Architecture

### Three executors, one Phase 1 contract

| Executor | File | Scope |
|---|---|---|
| Fleet orchestrator | `scripts/upgrade-brain.cjs` | Master-only, iterates `C:\Development\*` |
| VS Code extension | `heir/platforms/vscode-extension/src/bootstrap.ts` | Cockpit delivers the payload on the open workspace |
| LLM-callable muscle | [.github/muscles/brain-upgrade.cjs](../../muscles/brain-upgrade.cjs) `--mode Upgrade` | Single project, invoked by the LLM via this skill |

All three satisfy the same contract. The CJS executors import from:

```text
.github/muscles/shared/brain-upgrade-core.cjs
```

The extension is TypeScript and mirrors the contract; it cannot import the `.cjs` module directly but MUST implement identical guarantees.

### Two-phase model

| Phase | Owner | What it does |
|-------|-------|--------------|
| **Phase 1 — Mechanical** | Shared core (three executors) | Eligibility gate → backup → fresh install → version stamp → auto-preserve → auto-restore → additive settings merge |
| **Phase 2 — Semantic** | This skill (LLM) + muscle helpers | CI reconciliation → non-standard content review → semantic verification → summarize → ask before cleanup |

The boundary is strict: Phase 1 never makes judgment calls, Phase 2 never performs mechanical bulk moves without LLM decision.

---

## When to Activate

- After `node scripts/upgrade-brain.cjs --mode Upgrade` (fleet)
- After the VS Code extension's Initialize / Upgrade command
- After `node .github/muscles/brain-upgrade.cjs --mode Upgrade --brain-source <path>` (LLM-driven single-project)
- Whenever a `.github-backup-*` directory exists in a project root

---

## Phase 1 Recap — Mechanical Guarantees

Phase 2 relies on these contract guarantees from whichever executor ran:

### Eligibility (hard gates)

- No `.github` folder → not an Alex repo → skip
- `.github` present but not a recognized Alex brain (v8 `brain-version.json` with Alex architecture, or legacy CI pattern) → skip
- Locked/protected projects (`upgradeLock`, `MASTER-ALEX-PROTECTED.json`, `alex.workspace.protectedMode`) → skip before any mutation

### Mechanical copy

- `.github` renamed to `.github-backup-YYYYMMDD-HHMMSS` (never deleted)
- Fresh brain installed as clean baseline — **including the fresh trifecta**
- `brain-version.json` stamped with the target `version`, `architecture`, and `lastSync`. The legacy `.alex-brain-version` plain-text stamp is no longer written and is removed on upgrade if encountered (kept in the backup).

### Auto-preserved heir customization (from backup)

| Root | Config | Metadata |
|------|--------|----------|
| `NORTH-STAR.md` | `loop-menu.json` | `brain-version.json` → `identity` |
|  | `taglines.json` | `brain-version.json` → `upgradeLock` |
|  | `cognitive-config.json` | `brain-version.json` → `lockReason` |
|  | `markdown-light.css` |  |

### Auto-restored non-brain content (from backup)

| Directories | Root files |
|---|---|
| `workflows/` | `PULL_REQUEST_TEMPLATE.md` |
| `ISSUE_TEMPLATE/` | `dependabot.yml` |
| `episodic/` | `CODEOWNERS` |
| `memory/` | `FUNDING.yml` |
| `domain-knowledge/` | `MEMORY.md` |

### Additive settings merge

- `.vscode/settings.json` merged additively — existing user values win, new essential defaults fill gaps only

### Old CI, NORTH-STAR, and EXTERNAL-API-REGISTRY preserved for Phase 2

- `copilot-instructions.md` from backup saved as `copilot-instructions.backup.md` for the LLM to reconcile
- `NORTH-STAR.md` from backup saved as `NORTH-STAR.backup.md` for LLM-led curation (may also need relocation if previously misplaced)
- `EXTERNAL-API-REGISTRY.md` from backup saved as `EXTERNAL-API-REGISTRY.backup.md` so project-specific API sections (e.g., domain pipelines, publishing specs) can be merged into the fresh template

If any guarantee is missing, stop Phase 2 and report the mechanical gap rather than paper over it.

---

## Trifecta Protection

Phase 1 installs the fresh brain including the fresh trifecta. Phase 2 runs **from that freshly-installed trifecta**. During Phase 2, these files are **protected — never restored from backup**:

```text
.github/skills/brain-upgrade/SKILL.md
.github/instructions/brain-upgrade.instructions.md
.github/muscles/brain-upgrade.cjs
.github/muscles/shared/brain-upgrade-core.cjs
```

An old trifecta silently overwriting a new one is the worst possible failure mode — a self-downgrade of the upgrader. The muscle's `AutoRestore` mode refuses these paths by list. The LLM must also refuse to copy them during judgment-driven curation, even if the backup content looks "richer."

---

## Phase 2 — LLM Responsibilities

Phase 2 is a structured LLM pass over what Phase 1 couldn't safely decide mechanically. The LLM drives. The muscle helps.

### Critical-thinking stance

Phase 2 is semantic, not freeform. LLMs are inconsistent — the defense is a decision table, not judgment.

- For every `.backup.md` or unknown file, consult the tables below **before** acting. Don't reason from scratch each time.
- Refuse any action that would delete or overwrite content with no recoverable copy. When in doubt, leave the `.backup.md` in place and surface the ambiguity to the user.
- If a decision table doesn't cover the case, stop and ask — don't extrapolate silently.
- Apply the same critical-thinking posture the mechanical phase uses: "what edge case does this miss?" for each call you make.

### Step 1 — Inventory the backup

```bash
node .github/muscles/brain-upgrade.cjs --mode Scan
```

Read the report. Per project, the scan lists:

- `ROOT_FILE` — root files in backup not auto-restored or auto-preserved
- `UNKNOWN_DIR` — directories not in the brain and not in the auto-restore list
- `CI_CUSTOM` — `copilot-instructions.backup.md` exists and needs reconciliation
- `NORTH_STAR_CUSTOM` — `NORTH-STAR.backup.md` exists and needs LLM curation
- `API_REGISTRY_CUSTOM` — `EXTERNAL-API-REGISTRY.backup.md` exists and needs LLM merge
- `OLD_ARTIFACT` — known-obsolete files (e.g., pre-v8 `hooks.json`)

### Step 2 — Reconcile `copilot-instructions.md` semantically

The mechanical phase left the old CI at `copilot-instructions.backup.md`. The fresh template is now the active `copilot-instructions.md`. Merge project identity into the fresh template — additively.

Diff the two files. Look for project-specific content under these sections:

```text
## Context            → Merge into fresh ## Context
## Active Context     → Merge if still current, discard if stale
## Coding Standards   → Merge into fresh ## Context
## Tech Stack         → Merge into fresh ## Context
## Safety Imperatives → Project-specific I5+ items merge in
## User               → Project-specific user profile merges in
```

Rules:

- Additive only. Never replace fresh template sections with backup content wholesale.
- Preserve the fresh template's architecture, skills routing, and safety imperatives.
- Keep project identity: project name, domain, tech stack, user preferences, North Star reference.
- When done, delete `copilot-instructions.backup.md`.

### Step 2b — Curate `NORTH-STAR.md` semantically

If `.github/NORTH-STAR.backup.md` exists, the LLM decides its fate. NORTH-STAR is a semantic document — unlike config files, it is not auto-preserved mechanically. Apply judgment:

| Situation | Action |
|-----------|--------|
| Old NORTH-STAR is project-specific and still current | Replace the fresh generic `NORTH-STAR.md` with the old content |
| Old NORTH-STAR is generic template content (matches master fresh copy) | Keep the fresh copy, delete the backup |
| Old NORTH-STAR contains project vision worth merging into the fresh template | Additive merge |
| Old NORTH-STAR was at the wrong path (e.g., root of repo instead of `.github/`) | Move/normalize to `.github/NORTH-STAR.md` during reconciliation |
| Old NORTH-STAR is stale/abandoned | Archive or discard |

When done, delete `NORTH-STAR.backup.md`.

### Step 2c — Merge `EXTERNAL-API-REGISTRY.md` semantically

If `.github/EXTERNAL-API-REGISTRY.backup.md` exists, the fresh master template has been installed as the active `EXTERNAL-API-REGISTRY.md`. Heirs commonly append project-specific API sections (e.g. "Book Publishing Pipeline", "KDP Specs", "Healthcare FHIR Endpoints") to the bottom of the registry. Those must survive the upgrade.

| Situation | Action |
|-----------|--------|
| Backup has project-specific sections appended after the master template content | Append those sections to the fresh `EXTERNAL-API-REGISTRY.md` (additive) |
| Backup matches the master template verbatim (no custom sections) | Keep the fresh copy, delete the backup |
| Backup diverges from master template in its shared sections | Trust the fresh template for shared sections; only port project-specific additions |
| Backup contains stale API references no longer used | Discard — don't carry forward obsolete APIs |

Rules:

- **Additive only** — never replace fresh master sections with backup content wholesale
- **Project-specific sections first** — look below any heading that matches master's structure; those are the heir's additions
- **Preserve the fresh template's structure** — master-owned sections stay master-owned
- When done, delete `EXTERNAL-API-REGISTRY.backup.md`.

### Step 3 — Review non-standard content semantically

For each item the scan reports, apply judgment:

| Category | File / Dir | Default Decision |
|----------|------------|------------------|
| Project identity | `README.md`, `REPO-CONFIG.md`, `repository-metadata.md` | Copy forward |
| Domain knowledge at root | `DK-*.md` | Copy forward |
| Project-specific dirs | `templates/`, `scripts/`, `docs/`, anything unknown | Copy forward |
| **Protected trifecta paths** | anything in the Trifecta Protection list above | **Never restore — always skip** |
| Obsolete artifacts | `hooks.json` (pre-v8) | Skip |
| Already auto-preserved | Anything in the Phase 1 auto-preserve table | Skip — already handled |
| Schema-fragile config | `visual-memory.json`, `session-metrics.json` | Keep the fresh version |
| Master-only | `MASTER-ALEX-PROTECTED.json` | Never copy to heirs |

When unsure, keep it in the backup and flag it for user review.

Execute the safe moves with the muscle:

```bash
node .github/muscles/brain-upgrade.cjs --mode AutoRestore --include "ProjectName"
```

For interactive CI merging:

```bash
node .github/muscles/brain-upgrade.cjs --mode Curate --include "ProjectName"
```

### Step 4 — Semantic verification

Confirm the resulting heir is correct:

- `detectAlexBrain()` would still return `"v8"` (brain-version.json intact)
- Heir customizations survived: `NORTH-STAR.md` content, loop menu entries, taglines, cognitive config
- `.vscode/settings.json` still contains the user's existing customizations
- `copilot-instructions.md` loads cleanly and has project identity merged in
- Skills directory has the fresh brain's full skill set
- The trifecta itself (`.github/muscles/brain-upgrade.cjs` + skill + instruction) is the fresh version, not an old one
- No project-specific content was lost (spot-check against backup)

Mechanical sanity check (file counts and version stamp):

```bash
# Fleet:
node scripts/upgrade-brain.cjs --mode Verify --include "ProjectName"
# Single project (LLM / heir):
node .github/muscles/brain-upgrade.cjs --mode Verify --brain-source <path>
```

This is a sanity check, not the verification itself. The real verification is semantic — done by the LLM.

### Step 5 — Summarize and ask

Before touching backups, produce a short report for the user:

- What was auto-preserved (Phase 1)
- What was merged (Phase 2 CI reconciliation and auto-restored content)
- What was skipped and why
- What needs human review
- Any gaps vs. the pre-upgrade state

**Then explicitly ask the user** whether to delete the backup:

```bash
node .github/muscles/brain-upgrade.cjs --mode Clean --include "ProjectName"
```

Never run Clean without explicit user consent.

---

## Muscle CLI Reference

### Phase 1 (single project)

```bash
# Eligibility check (is this a recognized Alex brain? locked?)
node .github/muscles/brain-upgrade.cjs --mode Audit [--project-dir <path>]

# Mechanical upgrade (requires a fresh brain source on disk)
node .github/muscles/brain-upgrade.cjs --mode Upgrade \
  --brain-source <path-to-fresh-.github> \
  [--project-dir <path>] [--brain-version <ver>] [--dry-run]

# Verify installation against a brain source
node .github/muscles/brain-upgrade.cjs --mode Verify \
  --brain-source <path> [--project-dir <path>]

# Restore the most recent .github-backup-*
node .github/muscles/brain-upgrade.cjs --mode Rollback [--project-dir <path>] [--dry-run]
```

### Phase 2 (fleet-wide, narrow with --include)

```bash
node .github/muscles/brain-upgrade.cjs --mode Scan
node .github/muscles/brain-upgrade.cjs --mode AutoRestore [--dry-run]
node .github/muscles/brain-upgrade.cjs --mode Curate --include "ProjectName"
node .github/muscles/brain-upgrade.cjs --mode Clean --include "ProjectName"
```

---

## Hard Rules

1. **No `.github`, not an Alex repo.** Never upgrade it.
2. **Locked/protected brains are skipped before any mutation.** Non-negotiable.
3. **Backups are never deleted automatically.** Always ask the user.
4. **Settings merges are additive.** User customization wins over defaults.
5. **CI merging is additive.** Project identity merges into the fresh template, not the reverse.
6. **Protected trifecta paths are never restored from backup** — not by the muscle, not by the LLM.
7. **When in doubt, keep the backup.** Disk is cheap, lost customization isn't.
8. **Brain subdirectories are never overwritten from backup.** Only non-brain content flows back.
9. **Commit and push before upgrading.** The operator (or LLM on their behalf) MUST confirm the target project has a clean working tree and is pushed to its remote before Phase 1. Backups live on local disk only — if the machine is lost mid-upgrade, the remote is the recovery path.

---

## Per-Project Flow (quick reference)

```text
Phase 1 (mechanical, any executor):
  Eligibility gate → Backup → Fresh install (incl. trifecta) → Version stamp
  Auto-preserve heir files → Auto-restore non-brain content
  Additive settings merge

Phase 2 (semantic, LLM-led, runs from fresh trifecta):
  1. Scan backup (muscle)
  2. Reconcile copilot-instructions.md (LLM)
  3. Review non-standard content (LLM → muscle AutoRestore/Curate, protected paths refused)
  4. Semantic verification (LLM + mechanical Verify as sanity check)
  5. Summarize → ask user → Clean (muscle, with consent)
```

---

## Fleet-Wide Flow

```text
1. Audit:         node scripts/upgrade-brain.cjs --mode Audit
2. Upgrade:       node scripts/upgrade-brain.cjs --mode Upgrade   (Phase 1 for all eligible)
3. Scan:          node .github/muscles/brain-upgrade.cjs --mode Scan
4. Per-project semantic pass (Phase 2) for anything flagged
5. Verify:        node scripts/upgrade-brain.cjs --mode Verify    (mechanical sanity check)
6. Ask user → Clean per-project as consent is given
```

---

## Related Skills

- [heir-sync-management](../heir-sync-management/SKILL.md) — Master-to-heir sync
- [heir-bootstrap](../heir-bootstrap/SKILL.md) — Post-initialize customization
- [identity-customization](../identity-customization/SKILL.md) — CI personalization
