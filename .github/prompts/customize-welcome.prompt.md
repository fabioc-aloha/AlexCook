---
type: prompt
lifecycle: stable
inheritance: inheritable
description: "Guided welcome experience customization wizard"
application: "Run the full welcome customization workflow — detect project, generate configs, validate coherence"
mode: agent
currency: 2026-04-22
---

# Customize Welcome Experience

Read the skill at `.github/skills/welcome-experience-customization/SKILL.md` first.

## Instructions

1. **Detect** project context — read package.json, README, copilot-instructions.md, workspace structure
2. **Classify** project type using the template table in the skill
3. **Ask** the user to confirm detected type, preferred persona, and tone
4. **Generate** all config files in order: North Star → Identity → Taglines → Loop Menu
5. **Validate** cross-references between all generated files
6. **Report** what was created/updated with a summary table

## Rules

- Preserve the architecture layer (Safety + Routing) in copilot-instructions.md
- Taglines: 5-60 chars, 8-12 per project category, no generic filler
- Loop menu: max 5 groups, creative loop first, use phase filtering
- Always set `projectPhase` to match current reality
- Commit-ready output — all files should pass validation on first attempt
