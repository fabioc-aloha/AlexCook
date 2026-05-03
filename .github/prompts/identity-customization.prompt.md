---
type: prompt
lifecycle: stable
inheritance: inheritable
description: "Customize Alex's identity for this project"
application: "When the user wants to personalize the AI persona in copilot-instructions.md for their heir project"
mode: agent
currency: 2026-04-21
---

# Customize Project Identity

Customize the AI identity in `copilot-instructions.md` for this specific project.

## Instructions

1. Read `.github/skills/identity-customization/SKILL.md` for the full process
2. Read `.github/copilot-instructions.md` (current identity)
3. Read `.github/copilot-instructions.backup.md` if it exists (previous identity to mine)
4. Follow the 7-step customization process from the skill
5. Present the proposed `copilot-instructions.md` for approval before writing

## Key Constraints

- Preserve Safety and Routing sections verbatim
- No master-specific content (I1-I9, "Master Alex")
- No hardcoded user names — reference `/memories/`
- Under 80 lines total
- Delete `.backup.md` after curation is complete
