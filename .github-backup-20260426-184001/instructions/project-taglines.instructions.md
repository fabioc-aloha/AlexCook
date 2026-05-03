---
description: "Generate project-specific taglines for the Alex sidebar banner"
application: "When creating, updating, or reviewing project taglines configuration"
applyTo: "**/*tagline*,**/.github/config/taglines.json"
---

# Project Taglines

## Activation Triggers

- User says "create taglines", "update taglines", "customize banner"
- Working with `.github/config/taglines.json`
- User mentions "sidebar banner" or "rotating messages"

## Quick Protocol

1. **Read context**: Check North Star, README, project identity
2. **Generate categories**: project (required), vision, collaboration
3. **Write taglines**: 8-12 per category, <60 chars each
4. **Create config**: Write to `.github/config/taglines.json`
5. **Validate**: Ensure JSON is valid, all taglines under limit

## Context to Gather

| Source | Look for |
|--------|----------|
| `NORTH-STAR.md` | Vision statement, goals |
| `README.md` | Project description, unique value |
| `package.json` | Project name, keywords |
| Folder name | Identity cue |
| User profile | Name for personalization |

## Tagline Guidelines

### Do

- Keep under 60 characters (aim for 4-8 words)
- Use active voice, present tense
- Imply partnership (human + AI)
- Be confident without arrogance
- Make each unique — no near-duplicates

### Don't

- Write generic descriptions ("An AI assistant")
- Use questions as taglines
- Include punctuation like `!!!` or `?`
- Make promises you can't keep
- Use jargon only experts understand

## Output Format

```json
{
  "version": "1.0",
  "project": "{ProjectName}",
  "taglines": {
    "project": [
      "Tagline about project identity",
      "What makes this unique"
    ],
    "vision": [
      "Where this is headed"
    ],
    "collaboration": [
      "How we work together"
    ]
  }
}
```

## Related

- Skill: `.github/skills/project-taglines/SKILL.md`
- Prompt: `.github/prompts/project-taglines.prompt.md`
- Config: `.github/config/taglines.json`
