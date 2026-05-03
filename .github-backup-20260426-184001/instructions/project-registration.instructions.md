---
description: "Register projects in the fleet registry and track cross-project patterns"
application: "When managing project metadata, discovering patterns, or enabling fleet visibility"
applyTo: "**/*registry*,**/*fleet*,**/*project-health*"
---

# Project Registration

Register and update projects in the AI-Memory project registry for fleet-wide visibility.

## Quick Reference

| Operation | Command |
|-----------|---------|
| Scan all projects | `node scripts/scan-projects.cjs` |
| Registry location | `~/OneDrive/AI-Memory/project-registry.json` |
| Schema version | 2.0.0 |

## Core Operations

### Record Successful Pattern

When a solution works well:

1. Identify the reusable concept (e.g., "atomic-file-writes")
2. Update registry: `successfulPatterns.push("pattern-name")`
3. Document in project's knowledge base

### Query Fleet for Solutions

Before solving from scratch:

```javascript
const registry = require('~/AI-Memory/project-registry.json');
const solutions = registry.projects.filter(p => 
    p.successfulPatterns.includes('problem-domain')
);
```

### Update Health Metrics

After meditation or brain-qa:

- Update `health.skillCount`, `health.instructionCount`
- Set `health.lastMeditation` to ISO timestamp
- Increment `health.meditationCount`

## Status Transitions

- **active** → **maintenance**: No commits in 7 days
- **maintenance** → **archived**: No commits in 30 days
- Any → **active**: New development begins

## Skill Reference

Full procedures in [project-registration SKILL.md](../skills/project-registration/SKILL.md)
