---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Enforce .prompt.md frontmatter standards — description, application, agent/mode, and body length"
application: "When creating or editing .prompt.md files in .github/prompts/"
applyTo: "**/*.prompt.md"
currency: 2026-04-22
---

# Prompt Builder

Auto-loaded when editing `.prompt.md` files. Ensures brain-qa compliance.

## Mandatory Frontmatter

Every `.prompt.md` requires these YAML fields:

| Field | Gate | Example |
|-------|------|---------|
| `description` | **Yes** | "3-pass code review with confidence scoring" |
| `application` | **Yes** | "Review code for correctness, security, and maintainability" |

Plus one of:

- **Root prompts**: `agent: {AgentName}`
- **Loop prompts**: `mode: agent` + `tools: [...]`

## Pass Criteria

`description` + `application` both present, score >= 3/4, body > 20 lines.

## Skill Reference

Full patterns and checklist in `.github/skills/prompt-builder/SKILL.md`.
