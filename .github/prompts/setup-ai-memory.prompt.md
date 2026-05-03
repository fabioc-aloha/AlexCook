---
type: prompt
lifecycle: stable
inheritance: inheritable
description: "Set up or verify the AI-Memory folder for cross-project knowledge sharing"
application: "When setting up a new heir project or verifying AI-Memory folder exists"
mode: agent
currency: 2026-04-21
---

# Setup AI-Memory

Run the `alex.setupAIMemory` command to discover or create the shared AI-Memory folder.

## What AI-Memory Does

AI-Memory is a shared folder that stores cross-project knowledge:

- **global-knowledge.md** — patterns and insights that apply across all projects
- **notes.md** — session observations and quick notes
- **project-registry.json** — fleet of registered projects
- **user-profile.json** — user preferences and context
- **knowledge/** — domain-specific knowledge articles
- **patterns/** — reusable patterns extracted from projects
- **insights/** — cross-project insights and lessons learned

## Discovery Order

1. OneDrive: `~/OneDrive-*/AI-Memory/` (syncs across devices)
2. Local: `~/AI-Memory/`
3. Fallback: `~/.alex/AI-Memory/`
4. Custom: any user-chosen path via `alex.aiMemory.path` setting

## Steps

1. Run the **Setup AI-Memory** button in the sidebar Setup tab, or execute `Alex: Setup AI-Memory` from the command palette
2. Choose a location from discovered paths, suggested candidates, or browse for a custom folder
3. The extension scaffolds the directory structure and template files (never overwrites existing content)
4. The chosen path is saved to `alex.aiMemory.path` in VS Code settings

## After Setup

- Register this project in `project-registry.json`
- Use the global-knowledge sync skill to share insights across projects
- AI-Memory content is referenced by instructions like `global-knowledge.instructions.md`
