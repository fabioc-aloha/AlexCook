---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Orchestrate full welcome experience customization — loop menu, taglines, identity, North Star, and persona in one guided workflow"
application: "When customizing the Alex sidebar experience, onboarding a new project, or updating project identity"
applyTo: "**/*welcome*custom*,**/*customize*welcome*,**/*onboard*,**/.github/config/loop-menu.json,**/.github/config/taglines.json"
currency: 2026-04-22
---

# Welcome Experience Customization

Unified customization of the Alex welcome experience. Full workflow in `.github/skills/welcome-experience-customization/SKILL.md`.

## Quick Reference

| Surface | Config File |
|---------|-------------|
| Loop Menu | `.github/config/loop-menu.json` |
| Taglines | `.github/config/taglines.json` |
| Identity | `.github/copilot-instructions.md` (identity layer only) |
| North Star | `NORTH-STAR.md` |
| Cognitive Config | `.github/config/cognitive-config.json` |

## Workflow

1. Detect project context (package.json, README, workspace structure)
2. Classify project type (web app, API, data, infra, research, content, extension)
3. Generate all configs coherently (North Star → Identity → Taglines → Loop Menu)
4. Validate cross-references (vision ↔ taglines ↔ identity ↔ phase)

## Meditation Integration

During meditation, review welcome experience alignment:

- Are taglines still relevant to current project direction?
- Does the loop menu reflect actual workflow patterns? (check frecency)
- Has the project phase changed? Update `projectPhase` in loop-menu.json
- Does the identity still match the domain voice?
