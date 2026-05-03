---
description: "Cross-project knowledge search, pattern recognition, and insight management via unified AI-Memory"
application: "When searching for reusable patterns, applying lessons learned, or managing knowledge across projects"
applyTo: "**/*knowledge*,**/*insight*,**/*pattern*,**/*ai-memory*"
---

# Global Knowledge Management

## Source of Truth

**`AI-Memory/user-profile.json`** is the canonical source of truth for user identity across all heirs and projects. Never duplicate profile data in project configs or Copilot Memory.

| Data | Location | Scope |
|------|----------|-------|
| Name, role, identity | AI-Memory/user-profile.json | All projects |
| Preferences (style, learning) | AI-Memory/user-profile.json | All projects |
| Cross-project patterns | AI-Memory/global-knowledge.md | All projects |
| Fleet visibility | AI-Memory/project-registry.json | All projects |
| Project persona | .github/config/project-persona.json | One project |

## Project Registry: Cross-Project Discovery

**`AI-Memory/project-registry.json`** tracks all heir projects and their successful patterns. Use it to find "what worked elsewhere":

| Query | Registry Lookup |
|-------|-----------------|
| "webview patterns" | `projects[].successfulPatterns` where skill contains "webview" |
| "MCP examples" | `projects[].technologies` contains "mcp" |
| "testing friction" | `projects[].frictionPoints` where skill contains "test" |

Before solving a problem from scratch, check if another project solved it successfully.

## Search Strategy

1. Check AI-Memory/insights/ for existing patterns
2. Check project-local knowledge first (faster)
3. Escalate to global only when local insufficient
4. Record new patterns for future use

## Pattern Recognition

| Signal | Action |
|--------|--------|
| Solved similar problem before | Search AI-Memory |
| New technique worked well | Promote to insight |
| Pattern applies across projects | Store at global level |
| Pattern is project-specific | Keep in project docs |

## Insight Lifecycle

1. **Capture**: Record while fresh
2. **Validate**: Confirm in second context
3. **Generalize**: Abstract from specifics
4. **Store**: AI-Memory/insights/{domain}.md
5. **Apply**: Reference in future work

## Anti-Patterns

- Reinventing solutions that exist
- Over-generalizing one-off fixes
- Storing project-specific knowledge globally
- Duplicating user-profile.json in heirs

## Heir Contribution Procedures

Heirs are **active contributors** to the shared knowledge base:

### Contribute Pattern to Registry

After solving a problem elegantly:

```javascript
// Update own entry in project-registry.json
myEntry.successfulPatterns.push('pattern-name');
myEntry.health.lastMeditation = new Date().toISOString();
```

### Create Insight File

When a pattern proves valuable (reused 3+ times):

```bash
# Create: ~/AI-Memory/insights/GI-{topic}-{date}.md
```

Include: project, date, category, tags, context, discovery, evidence.

### Report Friction

When encountering recurring issues:

```javascript
// Update own entry
myEntry.frictionPoints.push('issue-description');
```

Or create feedback file:

```bash
# Create: ~/AI-Memory/feedback/{date}-friction-{slug}.md
```

### What Heirs Cannot Do

- Modify `user-profile.json` (read-only)
- Edit other projects' registry entries
- Delete global patterns (request via feedback)
