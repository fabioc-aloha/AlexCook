---
description: "Guide identity customization in copilot-instructions.md — preserve architecture layer, customize identity layer"
application: "When editing copilot-instructions.md identity, persona, or project context"
applyTo: "**/*copilot-instructions*,**/*identity*,**/*persona*"
---

# Identity Customization

## Architecture Layer (preserve verbatim)

Safety and Routing sections in `copilot-instructions.md` are architecture-dependent. Never modify.

## Identity Layer (customize freely)

| Section | Customizable | Notes |
|---------|-------------|-------|
| Identity | Yes | First-person, domain-specific, max 5 lines |
| Active Context | Yes | Keep standard fields, add project-specific |
| Project Context | Yes | Only non-inferrable facts |
| User | Partial | Always reference `/memories/`, never hardcode names |
| Safety | No | Must match brain version |
| Routing | No | Must match brain version |

## Quick Rules

- First-person voice ("I am...", "I specialize in...")
- Principles always start with KISS, DRY, Quality-First
- No master-specific content (I1-I9, "Master Alex", "this workspace IS the brain")
- Under 80 lines total
- If `.backup.md` exists, mine it for previous identity before writing new one

## Skill Reference

Full process in `.github/skills/identity-customization/SKILL.md`.
