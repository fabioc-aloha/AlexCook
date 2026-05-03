---
name: upgrade-curation
description: "Finalize brain upgrades by curating project-specific content from .github-backup-* directories"
tier: standard
applyTo: '**/*upgrade*,**/*curat*,**/*backup*,**/*finalize*'
---

# Upgrade Curation

> Finalize brain upgrades by recovering project-specific content from backups

After `upgrade-brain.ps1` runs, each project has a `.github-backup-YYYYMMDD/` directory containing the pre-upgrade brain. This skill guides the curation process: scan backups, identify what needs attention, and merge project-specific content into the fresh v8 brain.

---

## When to Use

- After running `upgrade-brain.ps1 -Mode Upgrade` or `-Mode Full`
- After the VS Code extension's Initialize command on a project
- When a project reports missing customizations post-upgrade
- To clean up `.github-backup-*` directories fleet-wide

---

## Quick Reference

### Muscle

```bash
# Scan all projects for pending backups and generate curation report
node .github/muscles/curate-upgrade.cjs --mode Scan

# Curate a single project (interactive)
node .github/muscles/curate-upgrade.cjs --mode Curate --include "ProjectName"

# Auto-restore non-brain content the upgrade missed
node .github/muscles/curate-upgrade.cjs --mode AutoRestore

# Clean up backups after curation is complete
node .github/muscles/curate-upgrade.cjs --mode Clean --include "ProjectName"
```

---

## What the Upgrade Leaves Behind

The upgrade script auto-restores these from backup:

| Auto-Restored Dirs | Auto-Restored Files |
|---|---|
| `workflows/` | `PULL_REQUEST_TEMPLATE.md` |
| `ISSUE_TEMPLATE/` | `dependabot.yml` |
| `episodic/` | `CODEOWNERS` |
| `memory/` | `FUNDING.yml` |
| `domain-knowledge/` | `MEMORY.md` |

Everything else in the backup that isn't a brain directory needs manual curation.

---

## Curation Categories

### Category 1: Project-Specific Root Files

Files in `.github/` root that aren't part of the brain and weren't in the auto-restore list:

| File | Action |
|---|---|
| `NORTH-STAR.md` | Copy to new `.github/` — project vision document |
| `README.md` | Copy — project-specific .github readme |
| `REPO-CONFIG.md` | Copy — repository configuration |
| `repository-metadata.md` | Copy — project metadata |
| `DK-*.md` | Copy — domain knowledge files at root level |
| `hooks.json` | **Skip** — replaced by `hooks/` directory in v8 |

### Category 2: Non-Standard Directories

Directories not in BRAIN_SUBDIRS and not in RESTORE_DIRS:

| Directory | Action |
|---|---|
| `templates/` | Copy — project-specific templates |
| `scripts/` | Copy — project-specific scripts |
| `docs/` | Copy — project-specific documentation |
| Any unknown dir | Copy — preserve project content |

### Category 3: copilot-instructions.md Curation

The upgrade installs a generic v8 `copilot-instructions.md`. The backup contains the old one with project-specific context.

**Curation steps:**

1. Open `copilot-instructions.backup.md` (saved by upgrade script)
2. Look for these project-specific sections:

   ```text
   ## Context          → Merge into v8 ## Context section
   ## Active Context   → Merge or discard (may be stale)
   ## Coding Standards  → Merge into v8 ## Context section
   ## Tech Stack       → Merge into v8 ## Context section
   ```

3. Copy relevant content into the v8 `copilot-instructions.md`
4. Delete `copilot-instructions.backup.md` when done

### Category 4: Config Merging

The v8 brain installs standard config files. Some projects had custom config:

| Config File | Action |
|---|---|
| `taglines.json` | Merge — project-specific taglines |
| `visual-memory.json` | Keep v8 — schema may have changed |
| `session-metrics.json` | Keep v8 — schema may have changed |
| `MASTER-ALEX-PROTECTED.json` | Skip — Master-only |

---

## Curation Workflow

### Per-Project Flow

```text
1. Run muscle: node .github/muscles/curate-upgrade.cjs --mode Scan
2. Review report for each project
3. For each finding:
   a. ROOT_FILE → copy to .github/
   b. UNKNOWN_DIR → copy to .github/
   c. CI_CUSTOM → merge project context into v8 CI
   d. OLD_ARTIFACT → skip (hooks.json, old assets)
4. Mark project as curated
5. Delete backup when confident
```

### Fleet-Wide Flow

```text
1. Scan:       node .github/muscles/curate-upgrade.cjs --mode Scan
2. AutoRestore: node .github/muscles/curate-upgrade.cjs --mode AutoRestore  (safe auto-copy)
3. Manual:     node .github/muscles/curate-upgrade.cjs --mode Curate --include "project"  (CI merging)
4. Verify:     upgrade-brain.ps1 -Mode Verify  (confirm brain intact)
5. Clean:      node .github/muscles/curate-upgrade.cjs --mode Clean  (remove backups)
```

---

## Safety Rules

1. **Never delete backups before verifying** — run `upgrade-brain.ps1 -Mode Verify` first
2. **Never overwrite brain dirs** — only copy non-brain content from backups
3. **CI merging is additive** — add project context to v8 template, don't replace it
4. **When in doubt, keep the backup** — disk is cheap, lost data isn't

---

## Related Skills

- [heir-sync-management](../heir-sync-management/SKILL.md) — Master-to-heir sync
- [heir-bootstrap](../heir-bootstrap/SKILL.md) — Post-initialize customization
- [identity-customization](../identity-customization/SKILL.md) — CI personalization
