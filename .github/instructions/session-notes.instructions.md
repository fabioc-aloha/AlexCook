---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Capture session observations, reminders, and quick notes to AI-Memory/notes.md"
application: "When user asks to note, remember, or save something for later, or during consolidation"
applyTo: "**/*notes*,**/*session*,**/*reminder*"
currency: 2026-04-20
---

# Session Notes

Auto-loaded for note capture requests and session summaries.

## Triggers

| User Says | Action |
|-----------|--------|
| "note this", "save this note" | Append to Quick Notes |
| "remind me", "remember to" | Append to Reminders |
| "interesting — ", "I noticed" | Append to Observations |
| "consolidate", "meditate" | Review + prune notes.md |

## Capture Rules

1. **Date every entry**: `- **YYYY-MM-DD**: [content]`
2. **One line per note**: Keep entries atomic — one fact, one reminder, one observation
3. **Choose the right section**: Quick Notes (facts/decisions), Reminders (deadlines/follow-ups), Observations (non-obvious behavior)
4. **Don't duplicate**: Check if the content already exists in `global-knowledge.md` or `learning-goals.md`

## Muscle Command

```bash
node .github/muscles/update-notes.cjs --note "content" --section quick|reminder|observation
```

## Location

| Platform | Path |
|----------|------|
| VS Code (Windows) | `%OneDrive%/AI-Memory/notes.md` |
| VS Code (macOS) | `~/Library/CloudStorage/OneDrive-*/AI-Memory/notes.md` |
| M365 / Agent Builder | OneDrive > AI-Memory > notes.md |
| Local fallback | `~/.alex/AI-Memory/notes.md` |

## Pruning (During Consolidation)

| Entry State | Action |
|-------------|--------|
| Reminder with passed deadline | Delete |
| Note referenced 3+ times | Promote to `global-knowledge.md` |
| Observation validated cross-project | Promote to `global-knowledge.md` |
| Stale (>30 days, no references) | Delete |
