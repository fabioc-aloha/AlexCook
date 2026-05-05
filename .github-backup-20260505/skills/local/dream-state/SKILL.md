---
type: skill
lifecycle: stable
inheritance: inheritable
name: "dream-state"
description: "Architecture maintenance, connection validation, automated health diagnostics, and unconscious processing"
tier: standard
applyTo: '**/*dream*,**/*maintenance*,**/*health*'
disable-model-invocation: true
currency: 2026-04-22
---

# Dream State Skill

Automated architecture maintenance — scan every memory file, validate structural integrity, produce a diagnostic report. Dream observes and measures; it never modifies.

## When to Use

- User asks to "dream" or run "architecture maintenance"
- After file reorganizations that may break connections
- Before major meditation sessions (establish baseline)
- After domain learning to validate new connections
- When architecture health is uncertain before skill selection

## 6-Phase Protocol

| Phase | Action | Output |
|-------|--------|--------|
| 1. Discovery | Scan `.github/` for all memory files | File inventory |
| 2. Validation | Parse frontmatter, verify trifecta completeness | Issue list |
| 3. Repair | Auto-fix via consolidation mappings (renames only) | Repair log |
| 4. GK Sync | Check `%OneDrive%/AI-Memory/` for cross-platform content | Sync status |
| 5. Reporting | Generate health report with statistics | Markdown report |
| 6. Display | Show results, open report in VS Code | Notification |

## Health Metrics

| Metric | Healthy | Concern |
|--------|---------|---------|
| Broken connections | 0 | Any |
| Missing frontmatter | 0 | Any |
| Incomplete trifectas | 0 | Any high-use skills |
| Brand violations | 0 (outside exceptions) | Any |
| Version drift | All match | Any mismatch |
| Review queue size | 0–5 pending | >10 pending (semantic debt accumulating) |
| Review queue age | Oldest <30d | Oldest >60d (stale reviews indicate blocked curation) |

### Review-Queue Backpressure (FM10)

The review queue (`.github/quality/review-queue.jsonl`, defined in FM5) is a leading indicator of semantic debt. When the queue grows faster than it's resolved, the architecture is accumulating unreviewed changes.

| Signal | Threshold | Health Impact | Action |
|--------|-----------|---------------|--------|
| Queue size growing | >10 pending entries | `needs-attention` | Prioritize review session; schedule meditation |
| High-priority entries stale | Any `high` priority entry >14d unresolved | `needs-attention` | Escalate: these are heir-feedback or drift-detected entries |
| Queue empty | 0 pending | `healthy` | Normal state; curation is keeping pace |
| Oldest entry age | >60 days | `needs-attention` | Something is blocking reviews; investigate |

**Per-volatility weighting**: High-volatility files (instructions, skills with frequent edits) generate more queue pressure than stable reference docs. Weight queue entries by the source file's edit frequency when computing backpressure score.

**Integration**: Dream protocol reads `review-queue.jsonl` during Phase 2 (architecture scan) and includes queue metrics in the dream report's health assessment.

## Ritual Hierarchy

**Meditation is the foundational ritual.** Dream is a diagnostic that runs subordinate to it.

| | Dream | Meditation |
|---|---|---|
| Role | Diagnostic tool | Foundational ritual |
| Mode | Automated, unconscious | Interactive, conscious |
| Creates files? | Reports only | Memory files + insights |
| Makes decisions? | Never | Yes |
| Activation | `/dream`, or chained after meditation | User says "meditate" |
| Analogy | Blood test | Doctor's visit |

### When Dream Chains After Meditation

Dream triggers automatically after meditation when:

| Trigger | Condition |
|---|---|
| Pattern: file reorg | Meditation touched 3+ architecture files |
| Pattern: trifecta concern | Meditation created or modified skills/instructions |
| Pattern: staleness | Last dream was >7 days ago |
| Random | ~1 in 5 meditations (keeps architecture fresh) |

## Connection Format

Skills connect via frontmatter `applyTo` patterns and semantic search:

```yaml
---
name: "skill-name"
description: "What this skill does"
applyTo: '**/*pattern*,**/*files*'
---
```

Valid relations: `applies-to`, `extends`, `requires`, `contradicts`, `supersedes`

## Report Template

```markdown
# Dream Report — YYYY-MM-DD

## Summary
- **Files Scanned**: N
- **Trifecta Completeness**: N/N
- **Broken Links**: 0
- **Brand Violations**: 0
- **Status**: HEALTHY / ATTENTION REQUIRED

## Issues Found
| File | Issue | Severity |
|------|-------|----------|

## Recommendations
Prioritized list of manual fixes needed.
```

## Interpreting Results

| Status | Meaning | Action |
|--------|---------|--------|
| HEALTHY | All checks pass, no broken connections | None — architecture is sound |
| ATTENTION REQUIRED | One or more issues detected | Review issues table, prioritize by severity |

Severity levels: **critical** (broken trifecta), **warning** (missing frontmatter field), **info** (cosmetic).

## Escalation: When Findings Need Human Judgment

Dream is a diagnostic — it never modifies files. When findings require judgment (skill consolidation, content quality decisions, contradiction resolution), the natural next step is **meditation**, which reads the dream report and decides what to fix.

| Finding type | Resolution path |
|---|---|
| Missing frontmatter, broken link with mapping | Author the fix in the next meditation; mechanical |
| Two skills with overlapping `applyTo` | Meditation decides merge / split / keep; semantic |
| Skill flagged as shallow | Meditation enriches or deprecates; requires domain context |
| Trifecta where instruction contradicts skill | Meditation reconciles intent; requires understanding |
| Version drift master/heir | Meditation picks canonical; project-specific |

The handoff is the dream report file. Meditation's `Resolve` step explicitly evaluates whether a dream should chain after it; the inverse — meditation reading an existing dream report — happens naturally when a meditation session opens with "check the architecture first."

*This pattern replaces the former lucid-dream ritual (retired v8.4.0). The escalation concept lives here because dream is the producer of the findings; meditation is the consumer that decides.*

## Snapshot Schema (`.github/quality/dream-report.json`)

`dream-cli.cjs` writes a single structural JSON snapshot every run. Heirs and graders depend on this shape; preserve it across versions.

| Field | Type | Purpose |
|---|---|---|
| `schemaVersion` | number | Currently `1`. Bump only with a heir migration plan. |
| `timestamp` | ISO string | Last dream run; consumed by `proactive-awareness` and `health-pulse`. |
| `workspace` | string | Absolute path of the dreamed workspace. |
| `inventory.skills` / `.instructions` / `.prompts` / `.agents` / `.total` | numbers | File counts under `.github/`. |
| `trifectaIssues[]` | `{type, skill, detail}` | Workflow skills missing matching `.instructions.md` or `.prompt.md`. |
| `brokenRefs[]` | `{sourceFile, line, target}` | Markdown / config references that no longer resolve. |
| `health` | `"healthy"` \| `"good"` \| `"needs-attention"` | Derived bucket: 0 / ≤5 / >5 issues. |

**Stability rule**: meditation, `dream-creativity-score.cjs`, and heir consumers (`health-pulse`, `proactive-awareness.instructions.md`) all read these field names directly. Adding fields is safe; renaming or removing requires a fleet-wide migration.

## Chronicle Pruning

`dream-cli.cjs` keeps the newest **50** `dream-report-YYYY-MM-DD*.md` chronicles in `.github/episodic/` after each run; older ones are deleted in place. Rolling architecture history lives in the JSON snapshot and `brain-qa` outputs — chronicles are only useful as recent narrative context for meditation.
