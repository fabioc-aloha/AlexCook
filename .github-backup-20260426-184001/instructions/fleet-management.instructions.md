---
description: "Fleet-wide brain synchronization — audit, upgrade, verify, rollback across heir projects"
application: "When managing multiple heir projects or synchronizing brain updates across the fleet"
applyTo: "**/*upgrade*brain*,**/*fleet*,**/*heir*sync*"
---

# Fleet Management

Keep heir projects synchronized with Master Alex brain updates.

## Quick Reference

| Operation | Command |
|-----------|---------|
| **Audit** | `.\scripts\upgrade-brain.ps1 -Mode Audit` |
| **Dry-run** | `.\scripts\upgrade-brain.ps1 -Mode Upgrade -DryRun` |
| **Upgrade** | `.\scripts\upgrade-brain.ps1 -Mode Upgrade` |
| **Full** | `.\scripts\upgrade-brain.ps1 -Mode Full` |
| **Verify** | `.\scripts\upgrade-brain.ps1 -Mode Verify` |
| **Rollback** | `.\scripts\upgrade-brain.ps1 -Mode Rollback -Include "name"` |

## Pre-Upgrade Checklist

1. Run brain QA: `node .github/muscles/brain-qa.cjs`
2. Verify "0 failing" in queue depth
3. Sync extension: `node .github/muscles/sync-architecture.cjs`
4. Sync heir template: `node scripts/sync-to-heir.cjs`

## Post-Upgrade Checklist

1. Verify: `.\scripts\upgrade-brain.ps1 -Mode Verify`
2. Curate custom CI from `.backup.md` files
3. Commit changes in each project
4. Delete `.github-backup-*` after verification

## Exclusions

Default exclusions: `AlexMaster`, `AlexMaster_Legacy`, `pbi`, `pbi-test`, `GCX_*`

Override: `-Include "project1,project2"` or modify `-Exclude` parameter.

## Rollback Path

Backups at `.github-backup-YYYYMMDD/` until manually deleted. Restore:

```powershell
Remove-Item ".github" -Recurse
Rename-Item ".github-backup-YYYYMMDD" ".github"
```
