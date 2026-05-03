---
description: "Customize Alex sidebar tabs — Loop buttons, Autopilot tasks, and project workflows"
application: "When customizing the Alex sidebar, adding buttons, or configuring scheduled tasks"
applyTo: "**/.github/config/loop-menu.json,**/.github/config/scheduled-tasks.json,**/scheduled-tasks/*.md"
---

# Sidebar Customization

Customize the Alex sidebar for your project's workflows.

## Config Files

| Tab | File | Purpose |
|-----|------|---------|
| **Loop** | `.github/config/loop-menu.json` | Workflow buttons |
| **Autopilot** | `.github/config/scheduled-tasks.json` | Scheduled tasks |

## Loop Tab Quick Reference

```json
{
  "groups": [{
    "id": "my-group",
    "label": "My Workflows",
    "icon": "rocket",
    "buttons": [{
      "icon": "lightbulb",
      "label": "Brainstorm",
      "command": "openChat",
      "prompt": "Help me brainstorm"
    }]
  }]
}
```

- **command**: `openChat` | `openExternal` | `runCommand`
- **promptFile**: Load from `.github/prompts/loop/{file}.prompt.md`
- **phase**: Array of `planning`, `active-development`, `testing`, `release`, `maintenance`
- **Live reload**: Changes apply immediately on save

## Autopilot Quick Reference

### Prerequisites for Agent Mode

- `COPILOT_PAT` secret in repo Settings → Secrets → Actions
- Copilot enabled for the repository

### Task Structure

```json
{
  "tasks": [{
    "id": "weekly-summary",
    "name": "Weekly Summary",
    "description": "Generate weekly project summary",
    "enabled": false,
    "mode": "agent",
    "schedule": "0 8 * * 1",
    "promptFile": ".github/config/scheduled-tasks/weekly-summary.md"
  }]
}
```

- **mode**: `agent` (Copilot writes) | `direct` (script runs)
- **schedule**: Cron expression in UTC (e.g., `0 8 * * 1` = Monday 8 AM)
- **promptFile**: Path to prompt template (agent mode)
- **muscle**: Path to script (direct mode)

### Creating a Task

1. Open Autopilot tab → **Add Task** (or edit JSON)
2. Create prompt template at `.github/config/scheduled-tasks/{id}.md`
3. Enable the task
4. Click **Generate Workflows**
5. Commit and push `.github/workflows/scheduled-*.yml`

### Prompt Template Structure

```markdown
# Task Name

## Task
What to accomplish.

## Instructions
1. Step-by-step procedure
2. File paths to read/write
3. How to name the PR

## Quality Standards
- Expected format and constraints
```

## Limitations

- VS Code's `@` agent dropdown is NOT customizable (built-in feature)
- Setup tab is not customizable
- To hide agents from dropdown, delete their `.agent.md` files

## Signal-Driven Autopilots

React to application signals (search patterns, errors, user behavior) instead of just cron schedules.

### Two-Phase Pattern

| Phase | Component | Purpose |
|-------|-----------|----------|
| **Collect** | Scheduled task (daily) | Query signal source → write local cache |
| **Surface** | SessionStart hook | Read cache → show suggestions (5s timeout) |

### Quick Setup

1. **Log signals** from your app to any queryable store (Table Storage, SQLite, API)
2. **Create collector** at `.github/muscles/collect-signals.cjs` — queries source, writes `.github/signals/suggestions.json`
3. **Create hook** at `.github/muscles/hooks/signal-advisor.cjs` — reads cache, returns `additionalContext`
4. **Register hook** in `.github/hooks.json` under `SessionStart`
5. **Schedule collector** in `scheduled-tasks.json` as `mode: "direct"`

### Cache Format

```json
{
  "updated": "2026-04-19T06:00:00Z",
  "suggestions": [
    { "topic": "sleep apnea", "reason": "repeated-query", "action": "Research this topic" }
  ]
}
```

### Why Two Phases?

SessionStart hooks have 5-second timeout. Network calls to external services are unreliable. Local file reads are fast and reliable.

## Skill Reference

Full customization guide in `.github/skills/sidebar-customization/SKILL.md`.
