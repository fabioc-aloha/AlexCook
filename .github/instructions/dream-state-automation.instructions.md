---
type: instruction
lifecycle: stable
inheritance: inheritable
applyTo: "**/*dream*,**/*brain-qa*"
description: "Automated architecture maintenance and dream state processing protocols"
application: "When running dream protocol or troubleshooting architecture health"
currency: 2026-04-22
---

# Dream Protocol

Automated architecture diagnostics — scan, validate, report. Read-only; never modifies files.

## Activation

Run explicitly or chained after meditation:

```bash
node .github/muscles/brain-qa.cjs
```

For quick mode (CI or scheduled runs):

```bash
node .github/muscles/brain-qa.cjs --mode quick --quiet
```

### Dream Chaining After Meditation

Dream triggers automatically after meditation when:

- Meditation touched 3+ architecture files
- Meditation created or modified skills/instructions
- Last dream was >7 days ago
- Random (~1 in 5 meditations)

## 6-Phase Execution

| Phase | Action | Output |
|-------|--------|--------|
| 1. Discovery | Scan `.github/` for all memory files | File inventory |
| 2. Validation | Parse frontmatter, check trifecta completeness | Issue list |
| 3. Inheritance | Check Master/heir version drift via `inheritance.json` | Drift report |
| 4. AI-Memory Sync | Read `%OneDrive%/AI-Memory/` for cross-platform content | Sync status |
| 5. Brand Compliance | Scan `src/**/*.ts` and `assets/**/*.svg` for deprecated colors | Violation count |
| 6. Reporting | Generate timestamped report in `.github/quality/` | Health report |

## Brand Compliance

- Deprecated: `#0078d4`, `#005a9e`, `#ff6b35`, `#ff8c42`, `#ffc857`, `#00ff88`
- Exception: `#0078D4` in `personaDetection.ts` (Developer persona, intentional)
- Skip: `marketing/`, `archive/` directories
- Pass: 0 violations outside exceptions

## Dream ↔ SSO Relationship

Dream validates the architecture that Skill Selection Optimization depends on. If dream finds incomplete trifectas, SSO's proactive skill survey may produce incomplete plans. Run dream first when architecture health is uncertain.

## Key Constraint

Dream NEVER modifies architecture files. It diagnoses; meditation and humans fix.

## Related Scripts

| Script | Purpose |
|--------|---------|
| `.github/muscles/brain-qa.cjs` | Brain health quality grid |

| `.github/muscles/validate-skills.cjs` | Skill frontmatter validation |

## OS-Level Scheduling

Weekly dream at 3 AM Sunday:

- **macOS**: `launchd` plist with `StartCalendarInterval` → `~/Library/LaunchAgents/com.alex.dream.plist`
- **Linux**: `crontab -e` → `0 3 * * 0 node /path/brain-qa.cjs --mode quick --quiet`
- **Windows**: `Register-ScheduledTask -TaskName "AlexDream" -Trigger (New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 3am)`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Missing frontmatter in report | Add `applyTo`/`description` to flagged files, re-run |
| Memory files not found | Verify `.github/` exists, workspace is open |
| No report generated | Check `.github/quality/` write permissions |
