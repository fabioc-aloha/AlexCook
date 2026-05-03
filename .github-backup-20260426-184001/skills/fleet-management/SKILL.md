---
name: "fleet-management"
description: "Keep heir projects synchronized with Master Alex brain updates — audit drift, upgrade brains, verify deployments"
tier: standard
applyTo: '**/*fleet*,**/*upgrade*brain*,**/*heir*sync*'
---

# Fleet Management

> Maintain cognitive architecture consistency across all heir projects from Master Alex.

## The Challenge

Master Alex evolves continuously — new skills, refined instructions, fixed defects. Heir projects run stale brains unless actively synchronized. Manual updates across 50+ projects is error-prone and tedious.

## Fleet Operations Model

```
┌─────────────────────────────────────────────────────────────────┐
│  Master Alex (.github/)                                         │
│    ↓ sync-architecture.cjs                                      │
│  Extension Brain (platforms/vscode-extension/.github/)          │
│    ↓ upgrade-brain.ps1                                          │
│  Fleet (C:\Development\*\.github/)                              │
└─────────────────────────────────────────────────────────────────┘
```

## Tools

| Script | Purpose | Location |
|--------|---------|----------|
| `upgrade-brain.ps1` | Fleet-wide brain upgrade | `scripts/` |
| `sync-architecture.cjs` | Master → Extension sync | `.github/muscles/` |
| `sync-to-heir.cjs` | Master → Heir template sync | `scripts/` |
| `curate-upgrade.cjs` | Post-upgrade curation | `.github/muscles/` |

## Workflow

### Phase 1: Prepare Master

Before fleet upgrade, ensure Master Alex is healthy:

```powershell
# 1. Run brain QA
node .github/muscles/brain-qa.cjs

# 2. Verify zero failures
# Check: "0 failing" in queue depth

# 3. Sync to extension brain
node .github/muscles/sync-architecture.cjs

# 4. Sync to heir template
node scripts/sync-to-heir.cjs
```

### Phase 2: Audit Fleet

Discover what needs updating:

```powershell
# Audit all projects in C:\Development
.\scripts\upgrade-brain.ps1 -Mode Audit

# Audit specific projects
.\scripts\upgrade-brain.ps1 -Mode Audit -Include "health,pbi"
```

Output shows:
- Project count and brain formats
- Custom CI needing manual curation
- Workflows and memory to preserve
- Total files affected

### Phase 3: Upgrade Fleet

Two-phase approach — mechanical batch + semantic curation:

```powershell
# Dry-run first (always!)
.\scripts\upgrade-brain.ps1 -Mode Upgrade -DryRun

# Execute upgrade
.\scripts\upgrade-brain.ps1 -Mode Upgrade

# Or full pipeline: Audit → Upgrade → Verify
.\scripts\upgrade-brain.ps1 -Mode Full
```

The script:
1. Renames `.github/` → `.github-backup-YYYYMMDD/` (atomic, instant rollback available)
2. Installs fresh brain from extension source
3. Restores non-brain content (workflows, episodic memories, domain knowledge)
4. Saves old `copilot-instructions.md` as `.backup.md` for identity curation

### Phase 4: Verify

Confirm deployments succeeded:

```powershell
.\scripts\upgrade-brain.ps1 -Mode Verify
```

Checks:
- `.alex-brain-version` stamp matches expected
- All brain subdirectories present with correct file counts
- `copilot-instructions.md` is v8 format
- `hooks.json` registry exists

### Phase 5: Curate

Projects with custom CI need manual curation:

```powershell
# Scan backups for custom content
node .github/muscles/curate-upgrade.cjs --mode Scan

# Review each project's backup
# Merge project-specific content back into fresh CI
# Delete backup when satisfied
```

## Exclusions

Some projects are excluded by default:

| Project | Reason |
|---------|--------|
| `AlexMaster` | Source of truth — never overwrite |
| `AlexMaster_Legacy` | Archive |
| `GCX_*` | Custom CI, manual sync |

Override with `-Include` or modify `-Exclude` parameter.

## Rollback

If something goes wrong:

```powershell
# Rollback specific project
.\scripts\upgrade-brain.ps1 -Mode Rollback -Include "projectname"

# Manual rollback (any time before backup deletion)
Remove-Item "C:\Development\project\.github" -Recurse
Rename-Item "C:\Development\project\.github-backup-YYYYMMDD" ".github"
```

## Scheduled Maintenance

Add to Autopilot for weekly fleet health checks:

```json
{
  "id": "fleet-health",
  "name": "Fleet Health Check",
  "description": "Audit fleet brain versions and drift",
  "schedule": "0 8 * * 1",
  "mode": "direct",
  "script": "scripts/upgrade-brain.ps1",
  "args": "-Mode Audit"
}
```

## Version Stamps

Each upgraded project gets `.github/.alex-brain-version`:

```
8.0.1
```

Check fleet versions:

```powershell
Get-ChildItem C:\Development -Directory | 
  ForEach-Object { 
    $v = Join-Path $_.FullName ".github\.alex-brain-version"
    if (Test-Path $v) { 
      "$($_.Name): $(Get-Content $v)" 
    }
  }
```

## Drift Detection

Detect when heir projects have diverged from master:

```powershell
# Compare heir brain to source
$source = "C:\Development\AlexMaster\platforms\vscode-extension\.github"
$heir = "C:\Development\health\.github"

# Count differences in skills
$sourceSkills = (Get-ChildItem "$source\skills" -Directory).Count
$heirSkills = (Get-ChildItem "$heir\skills" -Directory).Count
Write-Host "Skills: $heirSkills (heir) vs $sourceSkills (source)"
```

## Best Practices

1. **Always dry-run first** — `.\scripts\upgrade-brain.ps1 -Mode Upgrade -DryRun`
2. **Audit before upgrade** — Know what you're changing
3. **Verify after upgrade** — Confirm success before deleting backups
4. **Keep backups until satisfied** — `.github-backup-*` is your rollback path
5. **Curate custom CI** — Don't lose project-specific identity
6. **Commit after curation** — Track the upgrade in git history

## Common Issues

| Issue | Solution |
|-------|----------|
| "backup already exists" | Delete old backup or use different date |
| "missing brain subdirectory" | Verify extension brain is synced |
| "version mismatch" | Re-run upgrade or check source version |
| CI lost project identity | Restore from `.backup.md` or backup dir |
