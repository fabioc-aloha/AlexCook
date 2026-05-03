---
type: skill
lifecycle: stable
inheritance: inheritable
name: "sidebar-customization"
description: "Customize the Alex sidebar — Loop tab buttons and project-specific workflows"
tier: standard
applyTo: '**/.github/config/loop-menu.json,**/*sidebar*config*'
currency: 2026-04-22
---

# Sidebar Customization

Customize the Alex sidebar tabs for your project — add buttons and tailor workflows to your team's needs.

> **For full welcome experience customization** (loop menu + taglines + identity + North Star in one pass), see the `welcome-experience-customization` skill.

## Quick Reference

| Tab | Config File | What It Controls |
|-----|-------------|------------------|
| **Loop** | `.github/config/loop-menu.json` | Workflow buttons, creative loop phases |
| **Setup** | Built-in | No customization (core Alex features) |

---

## Loop Tab Customization

The Loop tab displays workflow buttons organized into collapsible groups. Everything is config-driven.

### Config Location

```
.github/config/loop-menu.json
```

### Minimal Example

```json
{
  "$schema": "../../../heir/.github/config/loop-config.schema.json",
  "version": "1.0",
  "projectType": "generic",
  "projectPhase": "active-development",
  "groups": [
    {
      "id": "my-workflows",
      "label": "My Workflows",
      "icon": "rocket",
      "collapsed": false,
      "buttons": [
        {
          "icon": "lightbulb",
          "label": "Brainstorm",
          "command": "openChat",
          "prompt": "Help me brainstorm ideas for this feature"
        }
      ]
    }
  ]
}
```

### Group Schema

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier (lowercase, hyphens) |
| `label` | Yes | Display text in sidebar |
| `icon` | No | Codicon name (e.g., `rocket`, `tools`, `beaker`) |
| `accent` | No | CSS hex color for accent bar (e.g., `#14b8a6`) |
| `collapsed` | No | Start collapsed? Default: `true` |
| `phase` | No | Array of phases when visible: `planning`, `active-development`, `testing`, `release`, `maintenance` |
| `buttons` | Yes | Array of button definitions |

### Button Schema

| Field | Required | Description |
|-------|----------|-------------|
| `icon` | Yes | Codicon name |
| `label` | Yes | Button text |
| `command` | Yes | Action type: `openChat`, `openExternal`, `runCommand` |
| `prompt` | No | Inline prompt text for `openChat` |
| `promptFile` | No | Path to `.prompt.md` file (overrides `prompt`) |
| `file` | No | URL or path for `openExternal`/`runCommand` |
| `tooltip` | No | Hover text |
| `phase` | No | Phases when visible |

### Command Types

| Command | Behavior |
|---------|----------|
| `openChat` | Opens Copilot Chat with the prompt |
| `openExternal` | Opens URL in browser or file in VS Code |
| `runCommand` | Executes a VS Code command |

### Using Prompt Files

For complex prompts, use external `.prompt.md` files:

```json
{
  "icon": "beaker",
  "label": "Run Tests",
  "command": "openChat",
  "promptFile": "test.prompt.md"
}
```

The file is loaded from `.github/prompts/loop/{promptFile}`.

### Phase-Based Visibility

Show buttons only during specific project phases:

```json
{
  "icon": "rocket",
  "label": "Release",
  "command": "openChat",
  "prompt": "@alex /release",
  "phase": ["testing", "release"]
}
```

### Live Reload

The sidebar watches `loop-menu.json` for changes. Save the file and buttons update immediately — no reload needed.

---

## Common Customization Patterns

### Add a Project-Specific Button Group

```json
{
  "id": "health-research",
  "label": "Health Research",
  "icon": "heart",
  "accent": "#ef4444",
  "collapsed": false,
  "source": "type",
  "buttons": [
    {
      "icon": "search",
      "label": "Literature Search",
      "command": "openChat",
      "prompt": "@Health Researcher Search for recent studies on {topic}"
    },
    {
      "icon": "note",
      "label": "Summarize Paper",
      "command": "openChat",
      "promptFile": "summarize-paper.prompt.md"
    }
  ]
}
```

### Use Agent Routing in Buttons

Route to specific Alex agents:

```json
{
  "icon": "beaker",
  "label": "Test Plan",
  "command": "openChat",
  "prompt": "@Validator Create a test plan for the current feature"
}
```

Available agents: `@Alex`, `@Builder`, `@Researcher`, `@Validator`, `@Planner`, `@Documentarian`, `@Presenter`, `@Frontend`, `@Backend`, `@Infrastructure`, etc.

---

## Limitations

### What You CAN Customize

- Loop tab button groups, labels, icons, prompts
- Button visibility by project phase
- Group ordering and collapse state

### What You CANNOT Customize

- VS Code Copilot's `@` agent dropdown (built-in feature)
- Setup tab contents (core Alex features)
- Health Pulse display format
- Creative Loop button order (always 1-6)

To hide agents from the `@` dropdown, delete or rename their `.github/agents/*.agent.md` files.

---

## Troubleshooting

### Loop Tab Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Buttons don't appear | Invalid JSON | Check for syntax errors, validate against schema |
| Changes not showing | File not saved | Save `loop-menu.json` |
| Wrong icon | Typo in codicon name | Check [codicon reference](https://microsoft.github.io/vscode-codicons/dist/codicon.html) |

### Validate Config

The schema is at `.github/config/loop-config.schema.json`. Most editors provide validation when `$schema` is set:

```json
{
  "$schema": "./../loop-config.schema.json",
  ...
}
```
