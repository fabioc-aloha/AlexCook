---
name: "lucid-dream"
description: "Hybrid dream-meditation protocol — conscious decisions during automated processing"
tier: standard
applyTo: '**/*lucid*,**/*dual-mode*,**/*bridge*'
disable-model-invocation: true
---

# Lucid Dream Skill

Conscious intervention during automated dream processing. When dream diagnostics find ambiguous issues that pure automation cannot resolve, lucid dream bridges to interactive decision-making.

## When to Use

- Dream report has findings marked "requires judgment"
- Two skills overlap and one should absorb the other
- A skill is flagged as shallow — needs enrichment or removal
- Architecture restructuring is recommended by dream diagnostics

## Lucid vs Dream vs Meditation

| | Dream | Lucid Dream | Meditation |
|---|---|---|---|
| Mode | Fully automated | Hybrid: auto scan + human decisions | Fully interactive |
| Input | None (zero-config) | Dream report findings | User-directed topic |
| Output | Diagnostic report | Resolved findings + applied fixes | New memory files |
| Modifies architecture? | Never | Yes, with human approval | Yes |
| Analogy | REM sleep | Lucid dreaming | Contemplation |

## Decision Framework

| Signal from Dream | Action | Owner |
|-------------------|--------|-------|
| Broken link, mapping exists | Auto-repair | Dream |
| Broken link, no mapping | Present options: remap, remove, or keep | Lucid |
| Missing frontmatter | Auto-flag | Dream → Lucid fills values |
| Overlapping `applyTo` | Present overlap analysis, recommend merge/split | Lucid |
| Shallow skill content | Present enrichment options or deprecation | Lucid |
| Version drift (master/heir) | Show diff, ask which is canonical | Lucid |
| Brand violation | Auto-flag with file + line | Dream → Lucid confirms fix |

## Resolution Patterns

### Skill Consolidation

Two skills overlap significantly → merge into one, update all references, redirect old name via mapping.

### Skill Enrichment

Skill flagged as shallow → research domain, add decision tables, examples, or integration patterns. If no real knowledge exists, deprecate.

### Architecture Restructuring

Dream finds systemic pattern (e.g., many skills missing prompts) → create batch fix plan, execute with confirmation per step.

## Completion Gate

All dream findings must reach one of:

| State | Meaning |
|-------|---------|
| Resolved | Fix applied and validated |
| Deferred | Logged with rationale for next session |
| Dismissed | False positive, documented why |

## Lucid Dream Session Flow

1. **Trigger**: Dream report contains findings marked "requires judgment"
2. **Load context**: Read dream report from `.github/quality/dream-report.json`
3. **Present findings**: Show each ambiguous finding with available options
4. **Collect decision**: User selects action for each finding (resolve, defer, dismiss)
5. **Execute**: Apply approved fixes to architecture files
6. **Validate**: Re-run affected checks to confirm resolution
7. **Log**: Update dream report with resolution status and rationale

## Integration with Dream State

Lucid dream extends the dream-state skill. Dream runs fully automated scans; when it encounters ambiguity, it flags findings for lucid intervention rather than guessing.

The handoff point is the dream report. Dream writes findings with a `requires_judgment: true` field. Lucid dream reads those findings and presents them interactively.

## Integration with Meditation

Lucid dream differs from meditation in scope. Meditation is open-ended exploration — the user directs the topic. Lucid dream is constrained to resolving specific dream findings. If a lucid dream session reveals a broader architectural concern, escalate to a meditation session.

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| Auto-resolving ambiguous findings | Dream guesses wrong, breaks architecture | Flag for lucid intervention |
| Deferring everything | Technical debt accumulates | Limit deferrals per session |
| Dismissing without rationale | Recurring false positives never get fixed | Require one-line justification |
| Mixing lucid dream with meditation | Scope creep — session loses focus | Escalate broad concerns to meditation |

## Output Artifacts

| Artifact | Location | Purpose |
|---|---|---|
| Updated dream report | `.github/quality/dream-report.json` | Resolution status for each finding |
| Modified architecture files | `.github/skills/`, `.github/instructions/` | Applied fixes |
| Session log | Memory tool or session memory | Decisions and rationale for future reference |
