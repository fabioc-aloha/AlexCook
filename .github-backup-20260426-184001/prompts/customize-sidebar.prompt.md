---
description: "Customize Alex sidebar — add Loop tab buttons or Autopilot scheduled tasks"
application: "When the user wants to add custom buttons, workflows, or scheduled tasks to the Alex sidebar"
mode: agent
agent: Alex
---

# Customize Sidebar

Analyze my project and help me customize the Alex sidebar.

## Context

Read the existing config files if they exist:
- `.github/config/loop-menu.json` (Loop tab buttons)
- `.github/config/scheduled-tasks.json` (Autopilot tasks)

## What I Need

${input:What would you like to customize? (e.g., "add a button for running tests", "create a weekly summary task", "add a research workflow group")}

## Instructions

1. **Analyze the request** — Determine if this is a Loop tab button, Autopilot task, or both
2. **Check existing config** — Read current config to understand what's already there
3. **Propose changes** — Show the JSON that needs to be added/modified
4. **Apply changes** — Update the config file(s)
5. **Verify** — Confirm the changes are valid JSON and match the schema

## For Loop Tab Changes

- Add to `groups` array in `loop-menu.json`
- Use appropriate codicons for buttons
- Set `command` to `openChat`, `openExternal`, or `runCommand`
- Use `promptFile` for complex prompts, inline `prompt` for simple ones
- Consider `phase` visibility if the button is only relevant during certain project phases

Example button:

```json
{
  "label": "Run Tests",
  "icon": "beaker",
  "command": "runCommand",
  "vsCommand": "workbench.action.tasks.runTask",
  "args": "npm test"
}
```

## For Autopilot Changes

- Add to `tasks` array in `scheduled-tasks.json`
- Choose `mode`: `agent` for creative tasks, `direct` for scripts
- Set appropriate `schedule` cron expression
- Create prompt template file if using agent mode
- Remind user to run "Generate Workflows" after changes

## Output

After making changes:
1. Show what was modified
2. Explain how to use the new feature
3. For Autopilot: remind about Generate Workflows step
