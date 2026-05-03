---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
model: claude-opus-4-6
description: 'Upgrade brain across all fleet heir projects with pre-flight checks and verification'
application: "When synchronizing Master Alex brain updates to all heir projects in the fleet"
currency: 2026-04-21
---

# Fleet Upgrade

Execute a controlled brain upgrade across all heir projects.

Create a TODO list for all steps. Mark each in-progress before starting, completed immediately after finishing.



After ANY file edit, run compilation check. Do not proceed until zero errors. If compilation or tests fail, fix and retry. Maximum 5 iterations per step.

## Pre-Flight

1. Run brain QA and verify zero failures
2. Sync to extension brain (`sync-architecture.cjs`)
3. Sync to heir template (`sync-to-heir.cjs`)
4. Commit any pending changes in Master Alex

## Execute

```bash
# Dry-run first
node scripts/upgrade-brain.cjs --mode Full --dry-run

# Execute upgrade
node scripts/upgrade-brain.cjs --mode Full
```

## Post-Upgrade

1. Review verify output for any failures
2. Scan for custom CI projects needing curation
3. Commit upgrade in each affected project
4. Clean up backups after verification

## Report

Summarize: projects upgraded, errors encountered, projects needing curation.


## Summary

After completing all steps, generate:
- Files changed (with counts)
- Verifications passed (compile, test, lint)
- Issues encountered and resolutions
- Anything requiring manual attention