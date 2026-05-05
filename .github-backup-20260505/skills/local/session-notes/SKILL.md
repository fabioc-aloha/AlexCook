---
type: skill
lifecycle: stable
name: "session-notes"
description: "Capture session observations, reminders, and quick notes to the shared AI-Memory/notes.md file"
tier: standard
applyTo: '**/*notes*,**/*session*,**/*reminder*,**/*observation*'
muscle: .github/muscles/update-notes.cjs
inheritance: inheritable
currency: 2026-04-20
---

# Session Notes

> Catch what matters before the session ends.

Capture observations, reminders, and quick notes during work sessions to `AI-Memory/notes.md`. Notes persist across AI surfaces (VS Code, M365 Copilot, Agent Builder) via OneDrive sync.

## When to Capture

| Signal | Example | Section |
|--------|---------|---------|
| User says "note this" or "remember" | "Note: SWA auth broke after custom domain" | Quick Notes |
| Deadline or follow-up needed | "Submit IEEE paper by May 15" | Reminders |
| Non-obvious behavior discovered | "Fabric REST API returns 200 on partial failure" | Observations |
| Session produces a decision | "Chose Cosmos over Table Storage for audit logs" | Quick Notes |
| User asks to save something for later | "Save this query for tomorrow" | Reminders |

## What Does NOT Go Here

| Content | Where It Belongs |
|---------|-----------------|
| Cross-project pattern (validated, reusable) | `AI-Memory/global-knowledge.md` |
| Learning objective or publication goal | `AI-Memory/learning-goals.md` |
| Identity, credentials, preferences | `AI-Memory/profile.md` |
| VS Code workflow tip (3-workspace rule) | `/memories/` (Copilot Memory) |
| Project-specific config | Project `.github/` or `.env` |

**Rule of thumb**: If the note is useful beyond this week, promote it. If it's a gotcha that applies to 3+ projects, it belongs in `global-knowledge.md`. Notes are the inbox; other files are the archive.

## Entry Format

Each entry is a dated bullet under the appropriate section:

```markdown
## Quick Notes

- **2026-04-20**: SWA embedded API overrides linked backend — remove api_location from workflow
- **2026-04-19**: Fleet upgrade completed, 42 projects verified

## Reminders

- **2026-04-20**: Submit IEEE Software paper #08 by May 15 deadline
- **2026-04-18**: Review AlexPapers HBR Art.4 co-author status with Venkatesh

## Observations

- **2026-04-20**: Fabric REST API returns 200 on partial failure — check response body
- **2026-04-19**: mermaid-cli v11 changed default theme — pastels now require explicit init
```

## Muscle Usage

```bash
# Add a quick note
node .github/muscles/update-notes.cjs --note "Fleet upgrade completed" --section quick

# Add a reminder
node .github/muscles/update-notes.cjs --note "Submit IEEE paper by May 15" --section reminder

# Add an observation
node .github/muscles/update-notes.cjs --note "Fabric API returns 200 on partial failure" --section observation

# List current notes (read-only)
node .github/muscles/update-notes.cjs --list
```

## Cross-Surface Behavior

| Surface | Read | Write |
|---------|------|-------|
| VS Code | Direct file read via OneDrive sync path | Muscle script or direct edit |
| M365 Copilot | OneDriveAndSharePoint capability | User saves code block to OneDrive |
| Agent Builder | OneDriveAndSharePoint capability | User saves code block to OneDrive |
| Hooks | session-start reads for context | stop hook can append session summary |

## Lifecycle

```
Capture (during session)
  ↓
Accumulate (notes.md grows)
  ↓
Promote (validated → global-knowledge.md, deadline met → delete)
  ↓
Prune (monthly: delete stale, promote worthy)
```

### Promotion Triggers

| Signal | Action |
|--------|--------|
| Note referenced 3+ times | Promote to `global-knowledge.md` |
| Reminder deadline passed | Delete or archive |
| Observation validated across projects | Promote to `global-knowledge.md` |
| Note becomes a procedure | Promote to instruction |

## Integration Points

- **Consolidation/meditation**: Review notes.md, promote or prune
- **Session hooks**: `session-start.cjs` reads notes for context; `stop.cjs` can append summary
- **Global knowledge curation**: Triage step includes "Move to Notes" for demoted entries
- **Heir feedback**: Feedback logged in `AI-Memory/feedback/`, not notes.md
