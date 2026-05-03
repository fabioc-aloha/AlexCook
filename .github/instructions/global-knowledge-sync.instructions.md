---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Synchronize insights across AI surfaces via the shared OneDrive AI-Memory folder"
application: "When syncing knowledge between VS Code, Copilot Chat, and other AI surfaces"
applyTo: "**/*global-knowledge-sync*,**/*ai-memory-sync*"
currency: 2026-04-20
---

# Global Knowledge Sync

## AI-Memory Location

| Platform | Path |
|----------|------|
| Windows | `%OneDrive%/AI-Memory/` (e.g., `~/OneDrive - Company/AI-Memory/`) |
| macOS | `~/Library/CloudStorage/OneDrive-*/AI-Memory/` |
| Fallback | `~/.alex/AI-Memory/` |
| M365 | OneDrive > AI-Memory via OneDriveAndSharePoint |

## Directory Structure

| Path | Content |
|------|---------|
| `global-knowledge.md` | Consolidated cross-project patterns |
| `notes.md` | Session notes, reminders, observations |
| `learning-goals.md` | Active learning objectives |
| `user-profile.json` | User identity and preferences |
| `project-registry.json` | Fleet project registry |
| `feedback/` | Heir bug reports and feature requests |
| `announcements/` | Fleet-wide announcements |
| `insights/` | Reserved for future individual insight files |
| `knowledge/` | Reserved for future domain knowledge |
| `patterns/` | Reserved for future pattern files |

## Sync Protocol

1. **Write locally**: Create/update in AI-Memory
2. **OneDrive syncs**: Automatic cloud sync
3. **Read globally**: Available from any workspace

## What to Sync

- Validated patterns (not hunches)
- User preferences
- Cross-project learnings

## Anti-Patterns

- Project-specific content in global
- Large files (slows sync)
- Sensitive data (cloud storage)
- Sensitive data (cloud storage)
- Conflicting writes from multiple surfaces
