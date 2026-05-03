---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Guide identity customization in copilot-instructions.md — preserve architecture layer, customize identity layer"
application: "When editing copilot-instructions.md identity, persona, or project context"
applyTo: "**/*copilot-instructions*,**/*identity*,**/*persona*"
currency: 2026-04-25
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
| User | Partial | Name + preferences only. All other identity fields go in `AI-Memory/user-profile.json` |
| Safety | No | Must match brain version |
| Routing | No | Must match brain version |

## User Section Token Budget

The `## User` section loads on every prompt. Keep it minimal.

**Carry inline (every prompt):**

- Name (needed for greeting/identity)
- Communication preferences (affect every response — e.g., "Direct, terse. Fix before asking.")
- Reference to `AI-Memory/user-profile.json` as source of truth

**Do NOT inline (load on-demand from JSON):**

- Role, title, employer
- Education, location, languages
- Domain expertise, project portfolio
- Social/professional links

### Template

```markdown
## User

[Name]. [One-line communication preferences].
- Full profile and preferences in `AI-Memory/user-profile.json` (source of truth).
- [Optional: one-line behavioral guidance]
```

If `AI-Memory/user-profile.json` does not exist yet, the User section may temporarily inline the profile — but flag it for migration. Per `global-knowledge.instructions.md` and `memory-curation`, the JSON is canonical.

## Quick Rules

- First-person voice ("I am...", "I specialize in...")
- Principles always start with KISS, DRY, Quality-First
- No master-specific content (I5-I8, "Master Alex", "this workspace IS the brain")
- Under 80 lines total
- If `.backup.md` exists, mine it for previous identity before writing new one

## Skill Reference

Full process in `.github/skills/identity-customization/SKILL.md`.
