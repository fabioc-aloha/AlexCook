---
type: prompt
lifecycle: stable
inheritance: inheritable
description: "Customize Alex sidebar — add Loop tab buttons and workflow groups"
application: "When the user wants to add custom buttons or workflows to the Alex sidebar"
mode: agent
agent: Alex
currency: 2026-04-21
---

# Customize Sidebar

Analyze my project and help me customize the Alex sidebar.

## Context

Read the existing config files if they exist:
- `.github/config/loop-menu.json` (Loop tab buttons)

## What I Need

${input:What would you like to customize? (e.g., "add a button for running tests", "add a research workflow group")}

## Instructions

1. **Analyze the request** — Determine the Loop tab button or group needed
2. **Check existing config** — Read current config to understand what's already there
3. **Propose changes** — Show the JSON that needs to be added/modified
4. **Apply changes** — Update the config file
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

## Output

After making changes:
1. Show what was modified
2. Explain how to use the new feature
