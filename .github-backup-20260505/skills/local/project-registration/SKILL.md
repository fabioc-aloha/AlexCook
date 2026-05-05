---
type: skill
lifecycle: stable
inheritance: inheritable
name: project-registration
description: "Register projects in the fleet registry and track cross-project patterns"
tier: standard
applyTo: '**/*registry*,**/*fleet*,**/*project-health*'
currency: 2026-04-22
---

# Project Registration Skill

Register and update project metadata in the AI-Memory project registry for fleet-wide visibility and cross-project pattern discovery.

## Purpose

Enable heirs to self-register in the centralized project registry, track successful patterns, document friction points, and promote reusable solutions to the fleet.

## Heir Contribution Model

Heirs are **active contributors** to the shared knowledge base, not passive consumers:

| Resource | Heir Can | Example |
|----------|----------|---------|
| `project-registry.json` | Update own entry | Add patterns, friction, health |
| `insights/` | Create new files | `GI-{topic}-{date}.md` |
| `feedback/` | Create new files | Report friction to Master |
| `user-profile.json` | Read only | Identity is centrally managed |

**Contribution flow:**
1. Heir solves a problem → records in `successfulPatterns`
2. Pattern reused 3x → promotes to `AI-Memory/insights/`
3. Master validates → graduates to `AI-Memory/patterns/`
4. Pattern syncs to all heirs

## Registry Location

```
~/OneDrive - Correa Family/AI-Memory/project-registry.json
```

The registry syncs across all machines via OneDrive. Never create local copies.

## Registry Schema (v2.0)

```json
{
  "path": "C:\\Development\\ProjectName",
  "name": "ProjectName",
  "description": "Brief project description",
  "lastAccessed": "2026-04-16T10:00:00.000Z",
  "status": "active|maintenance|archived",
  "technologies": ["nodejs", "typescript", "alex-brain"],
  "brainVersion": "8.0.0",
  "health": {
    "skillCount": 0,
    "instructionCount": 0,
    "lastMeditation": null,
    "meditationCount": 0
  },
  "successfulPatterns": ["pattern-name"],
  "frictionPoints": ["issue-description"],
  "promotedPatterns": ["pattern-promoted-to-master"]
}
```

## Autonomous Heir Operation

**Heirs operate WITHOUT Master Alex.** Each heir maintains its own registry entry using the `update-registry.cjs` muscle that syncs to the shared AI-Memory.

### Heir Self-Registration

```bash
# First-time registration
node .github/muscles/update-registry.cjs --register

# Update health metrics (run after brain changes)
node .github/muscles/update-registry.cjs

# Record meditation completion
node .github/muscles/update-registry.cjs --meditated

# Add successful pattern
node .github/muscles/update-registry.cjs --pattern "webview-state"

# Document friction point  
node .github/muscles/update-registry.cjs --friction "msal-token-refresh"
```

The muscle:
- Finds AI-Memory via OneDrive sync paths
- Creates/updates only THIS project's entry
- Never modifies other projects' data
- Works offline (queues for next sync)

### Heir Responsibilities

| Trigger | Action | Command |
|---------|--------|---------|
| First session in project | Self-register | `--register` |
| After meditation | Record completion | `--meditated` |
| Solved problem elegantly | Document pattern | `--pattern "name"` |
| Recurring issue | Document friction | `--friction "issue"` |
| Brain updated | Refresh health | (no args) |

## Procedures

### 1. Register Current Project (Master)

When Master Alex scans the fleet:

```bash
# Master Alex scanner muscle:
node scripts/scan-projects.cjs
```

For manual registration:

1. Read existing registry
2. Check if project already exists (match by path)
3. If exists, update metadata; if not, add new entry
4. Preserve existing successfulPatterns and frictionPoints
5. Write updated registry

### 2. Record Successful Pattern

When you solve a problem elegantly and it could help other projects:

```json
{
  "successfulPatterns": [
    "webview-state-management",
    "atomic-file-writes",
    "tmdl-parsing"
  ]
}
```

Pattern names should be:
- Lowercase, hyphenated
- Descriptive of the solution domain
- Referenceable across projects

### 3. Document Friction Point

When encountering recurring issues:

```json
{
  "frictionPoints": [
    "msal-token-refresh-race-condition",
    "webpack-5-esm-compatibility"
  ]
}
```

Before solving a problem from scratch, check if another project already solved it:

```javascript
// Query pattern
const registry = JSON.parse(fs.readFileSync(registryPath));
const solutions = registry.projects.filter(p => 
    p.successfulPatterns.includes('your-problem-domain')
);
```

### 4. Promote Pattern to Master

When a pattern proves valuable and should become a Master Alex capability:

1. Add to `promotedPatterns` array
2. Create skill/instruction/muscle trifecta in Master
3. Mark as promoted in registry

### 5. Update Project Health

After meditation or brain-qa runs:

```json
{
  "health": {
    "skillCount": 176,
    "instructionCount": 136,
    "lastMeditation": "2026-04-16T10:00:00Z",
    "meditationCount": 15
  }
}
```

## Cross-Project Discovery

### Find Projects with Similar Tech Stack

```javascript
const typescriptProjects = registry.projects.filter(p => 
    p.technologies.includes('typescript') && 
    p.status === 'active'
);
```

### Find Solutions to Known Problems

```javascript
// Find who solved SSE streaming
const sseExperts = registry.projects.filter(p => 
    p.successfulPatterns.some(pat => pat.includes('sse'))
);
```

### Identify Fleet Health

```javascript
const needsMeditation = registry.projects.filter(p => 
    p.status === 'active' && 
    !p.health.lastMeditation
);
```

## Status Definitions

| Status | Criteria | Registry Update Frequency |
|--------|----------|---------------------------|
| `active` | Modified in last 7 days | On every significant change |
| `maintenance` | Modified in last 30 days | Weekly or on changes |
| `archived` | Not modified in 30+ days | Rarely/never |

## Contributing Insights from Heirs

When an heir discovers a valuable pattern, contribute it to the shared knowledge base.

### 1. Create Insight File

```markdown
<!-- ~/AI-Memory/insights/GI-{topic}-{date}.md -->
---
project: project-name
date: 2026-04-17
category: backend|frontend|architecture|testing|devops
tags: [relevant, searchable, terms]
status: draft|validated
---

# Insight Title

## Context
What problem were you solving?

## Discovery
What pattern/solution did you find?

## Evidence
- Used in: [list files or scenarios]
- Reuse count: 3+

## Recommendation
How should other projects apply this?
```

### 2. Update Registry Entry

After contributing an insight, update your registry entry:

```javascript
// Mark that you contributed this pattern
myEntry.successfulPatterns.push('pattern-name');
```

### 3. Insight Promotion

Master Alex reviews `AI-Memory/insights/` during meditation:
- **Validated**: Promoted to `AI-Memory/patterns/GK-*.md`
- **Needs refinement**: Feedback added to file
- **Project-specific**: Stays as insight, not promoted

## Integration with Fleet Operations

The project registry powers:
- **Brain Ops**: Fleet-wide meditation scheduling
- **Pattern Discovery**: Cross-pollination of solutions
- **Health Monitoring**: Identify projects needing attention
- **Skill Promotion**: Pipeline from heir to master

## Related

- [global-knowledge.instructions.md](../../instructions/global-knowledge.instructions.md) — Cross-project knowledge queries
- `master-wiki/architecture/MEMORY-SYSTEMS.md` — Full memory architecture (master-only)
- [heir-sync-management.instructions.md](../../instructions/heir-sync-management.instructions.md) — Syncing changes to heirs
