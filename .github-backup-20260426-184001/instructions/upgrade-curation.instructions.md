---
description: "Finalize brain upgrades by curating project-specific content from .github-backup-* directories"
application: "After running upgrade-brain.ps1 or extension Initialize, when .github-backup-* directories exist"
applyTo: "**/*upgrade*,**/*curat*,**/*backup*,**/*finalize*"
---

# Upgrade Curation

Post-upgrade finalization. Scan `.github-backup-*` directories, recover project-specific content, merge CI context.

## Activation

When `.github-backup-*` directories exist after brain upgrade. Skill: `.github/skills/upgrade-curation/SKILL.md`. Muscle: `.github/muscles/curate-upgrade.cjs`.

## Quick Reference

| Mode | Command | Effect |
|------|---------|--------|
| Scan | `node .github/muscles/curate-upgrade.cjs --mode Scan` | Report what needs curation |
| AutoRestore | `node .github/muscles/curate-upgrade.cjs --mode AutoRestore` | Copy non-brain content automatically |
| Curate | `node .github/muscles/curate-upgrade.cjs --mode Curate --include "name"` | Interactive per-project |
| Clean | `node .github/muscles/curate-upgrade.cjs --mode Clean` | Remove backups after verification |

## Safety

- Never delete backups before `upgrade-brain.ps1 -Mode Verify`
- Never overwrite brain dirs from backup
- CI merging is additive — add project context, don't replace v8 template
