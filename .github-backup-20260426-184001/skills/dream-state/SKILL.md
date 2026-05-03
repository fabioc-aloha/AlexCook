---
name: "dream-state"
description: "Architecture maintenance, connection validation, automated health diagnostics, and unconscious processing"
tier: standard
applyTo: '**/*dream*,**/*maintenance*,**/*health*'
disable-model-invocation: true
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
