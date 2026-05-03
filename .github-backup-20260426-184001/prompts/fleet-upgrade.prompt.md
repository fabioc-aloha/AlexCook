---
mode: 'agent'
description: 'Upgrade brain across all fleet heir projects with pre-flight checks and verification'
application: "When synchronizing Master Alex brain updates to all heir projects in the fleet"
---

# Fleet Upgrade

Execute a controlled brain upgrade across all heir projects.

## Pre-Flight

1. Run brain QA and verify zero failures
2. Sync to extension brain (`sync-architecture.cjs`)
3. Sync to heir template (`sync-to-heir.cjs`)
4. Commit any pending changes in Master Alex

## Execute

```powershell
# Dry-run first
.\scripts\upgrade-brain.ps1 -Mode Full -DryRun

# Execute upgrade
.\scripts\upgrade-brain.ps1 -Mode Full
```

## Post-Upgrade

1. Review verify output for any failures
2. Scan for custom CI projects needing curation
3. Commit upgrade in each affected project
4. Clean up backups after verification

## Report

Summarize: projects upgraded, errors encountered, projects needing curation.
