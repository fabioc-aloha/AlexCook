---
name: "health-pulse"
description: "Health Pulse data model, status rules, scoring algorithms, and thresholds — the canonical source the extension consumes"
tier: standard
applyTo: '**/*health*,**/*pulse*,**/*status*,**/*scoring*'
disable-model-invocation: true
---

# Health Pulse Skill

Canonical source of truth for the Health Pulse feature. The extension reads these rules; the brain defines them.

## Data Model

```typescript
type HealthStatus = 'healthy' | 'attention' | 'critical';

interface HealthPulse {
  status: HealthStatus;

  // Connections
  connectionCount: number;
  connectionHealth: number; // percentage 0-100

  // Rituals
  lastDreamDate: Date | null;
  dreamNeeded: boolean;
  lastMeditationDate: Date | null;
  meditationCount: number;

  // Architecture
  trifectaCompleteness: number; // percentage 0-100
  architectureVersion: string;
  extensionVersion: string;
  syncStale: boolean;

  // Chat memory
  chatMemoryLines: number;
  chatMemoryWarning: boolean;
}
```

## B1: Health Status Rules

Three states, evaluated in priority order. First matching rule wins.

### Critical

| Rule | Condition | Rationale |
|------|-----------|-----------|
| Broken connections | `connectionHealth < 90` | Architecture integrity compromised |
| Sync failure | `syncStale && daysSinceSyncCheck > 3` | Heir running stale architecture |
| Dream overdue + issues | `dreamNeeded && daysSinceLastDream > 14` | Two weeks without diagnostics while issues exist |

### Attention

| Rule | Condition | Rationale |
|------|-----------|-----------|
| Dream recommended | `dreamNeeded` | Issues detected but not urgent |
| Dream stale | `daysSinceLastDream > 7` | Weekly cadence missed |
| Memory bloat | `chatMemoryWarning` | Chat memory exceeds threshold |
| Sync stale | `syncStale` | Heir behind master |
| Meditation gap | `daysSinceLastMeditation > 7` | No consolidation in a week |
| Trifecta gaps | `trifectaCompleteness < 80` | High-use skills missing components |

### Healthy

All other cases. No conditions matched above.

### Status Computation

```typescript
function computeHealthStatus(pulse: HealthPulse): HealthStatus {
  const daysSinceDream = pulse.lastDreamDate
    ? daysBetween(pulse.lastDreamDate, now())
    : Infinity;
  const daysSinceMeditation = pulse.lastMeditationDate
    ? daysBetween(pulse.lastMeditationDate, now())
    : Infinity;

  // Critical rules
  if (pulse.connectionHealth < 90) return 'critical';
  if (pulse.syncStale && daysSinceDream > 3) return 'critical';
  if (pulse.dreamNeeded && daysSinceDream > 14) return 'critical';

  // Attention rules
  if (pulse.dreamNeeded) return 'attention';
  if (daysSinceDream > 7) return 'attention';
  if (pulse.chatMemoryWarning) return 'attention';
  if (pulse.syncStale) return 'attention';
  if (daysSinceMeditation > 7) return 'attention';
  if (pulse.trifectaCompleteness < 80) return 'attention';

  return 'healthy';
}
```

## B2: Meditation History Parsing

Meditation history is tracked through file artifacts, not a dedicated log.

### Sources

| Source | What it tells you | How to read |
|--------|------------------|-------------|
| `/memories/repo/` entries | Repo facts created during meditation | File modification dates |
| `/memories/` user memory | Cross-project patterns | File modification dates |
| `.github/quality/dream-report.json` | Last dream run timestamp | JSON `timestamp` field |
| Git log | Files changed in meditation commits | `git log --grep="meditate\|consolidat"` |

### Metrics

| Metric | Computation | Use |
|--------|-------------|-----|
| `meditationCount` | Count of meditation artifacts this month | Activity level |
| `lastMeditationDate` | Most recent meditation artifact date | Staleness check |
| `daysSinceLastMeditation` | `now() - lastMeditationDate` | Attention trigger (>7 days) |

### Heuristic

Since meditation doesn't write to a central log, detect it by:

1. Check git log for commits with meditation keywords in the message
2. Check modification dates on `/memories/repo/` files
3. Check `.github/quality/` for recent reports
4. Fall back to workspace state stored by the extension

## B3: Dream State Markers

Dream produces diagnostic artifacts. These markers tell the extension when dream last ran and what it found.

### Primary Marker

File: `.github/quality/dream-report.json`

```json
{
  "timestamp": "2026-04-16T03:00:00Z",
  "skills": 173,
  "instructions": 133,
  "prompts": 81,
  "agents": 17,
  "trifectaIssues": 12,
  "brokenRefs": 3,
  "status": "ATTENTION_REQUIRED"
}
```

### Derived Flags

| Flag | Derivation | Threshold |
|------|------------|-----------|
| `dreamNeeded` | `brokenRefs > 0 \|\| trifectaIssues > 20` | Any broken refs or excessive trifecta gaps |
| `daysSinceLastDream` | `now() - report.timestamp` | >7 = attention, >14 = critical (if dreamNeeded) |
| `connectionHealth` | `1 - (brokenRefs / totalConnections) * 100` | <90% = critical |

### No Report Found

If `.github/quality/dream-report.json` doesn't exist:

- `dreamNeeded = true`
- `lastDreamDate = null`
- `daysSinceLastDream = Infinity`
- Nudge: "Run /dream to establish a health baseline"

## B4: Connection Health Scoring

Connection health measures the integrity of `applyTo` patterns and file references across the architecture.

### Algorithm

```typescript
function computeConnectionHealth(dreamReport: DreamReport): number {
  const total = dreamReport.skills + dreamReport.instructions + dreamReport.prompts;
  if (total === 0) return 100;

  const brokenRatio = dreamReport.brokenRefs / total;
  const health = Math.round((1 - brokenRatio) * 100);
  return Math.max(0, Math.min(100, health));
}
```

### Thresholds

| Health % | Status | Meaning |
|----------|--------|---------|
| 95-100 | Healthy | Normal — minor issues from recent edits |
| 90-94 | Attention | Several broken references — run meditation to fix |
| <90 | Critical | Architecture integrity at risk — fix immediately |

### What Counts as a Broken Connection

| Type | Detection | Severity |
|------|-----------|----------|
| `applyTo` pattern matches no files | Glob returns empty | Low (pattern may be aspirational) |
| Skill references nonexistent instruction | Cross-reference check | High |
| Instruction references moved file | Path validation | High |
| Prompt references nonexistent agent | Agent name check | Medium |

## B5: Chat Memory Audit Thresholds

VS Code Copilot Chat memory (`/memories/`) accumulates over time. Large memories waste context tokens.

### Thresholds

| Lines | Status | Action |
|-------|--------|--------|
| 0-150 | Healthy | No action |
| 151-200 | Attention | Review for consolidation opportunities |
| >200 | Warning | `chatMemoryWarning = true` — prune redundant entries |

### Audit Procedure

1. Count total lines across all files in `/memories/` (excluding `/memories/session/` and `/memories/repo/`)
2. Flag entries that are:
   - Duplicated across files
   - Outdated (references old versions, removed features)
   - Too verbose (>5 lines for a single fact)
3. Suggest consolidation: merge related entries, remove stale facts

### Memory Efficiency Score

```typescript
function computeMemoryEfficiency(lines: number): number {
  if (lines <= 150) return 100;
  if (lines <= 200) return Math.round(100 - ((lines - 150) / 50) * 30);
  return Math.max(0, Math.round(70 - ((lines - 200) / 100) * 70));
}
```

| Score | Meaning |
|-------|---------|
| 80-100 | Efficient — good information density |
| 50-79 | Adequate — some bloat |
| <50 | Needs curation — significant waste |

## Visual Indicators

| Status | Icon | Color | CSS Variable |
|--------|------|-------|-------------|
| Healthy | ✅ | Green | `--vscode-testing-iconPassed` |
| Attention | ⚠️ | Amber | `--vscode-editorWarning-foreground` |
| Critical | 🔴 | Red | `--vscode-editorError-foreground` |

## Extension Integration

The extension reads these rules by:

1. Running `dream-cli.cjs` to produce the dream report
2. Parsing `.github/quality/dream-report.json` for markers
3. Applying the status computation algorithm above
4. Rendering the Health Pulse card with the computed status

The skill defines the rules; the extension implements the computation.
