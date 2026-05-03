---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Token cost reduction for cognitive architecture files -- instruction/skill overlap, waste pattern detection, applyTo optimization"
application: "When implementing token waste elimination or reviewing code that uses these patterns"
applyTo: "**/.github/instructions/*.md,**/.github/skills/*/SKILL.md,**/.github/prompts/*.md"
currency: 2026-04-22
---

# Token Waste Elimination -- Auto-Loaded Rules

Full audit procedure, loading tier documentation, and VS Code mechanics -> see token-waste-elimination skill.

Full protocol in `.github/skills/token-waste-elimination/SKILL.md`.

## Quick Reference

| Content Type | Put In | Not In | Why |
|-------------|--------|--------|-----|
| Decision tables, quick rules | Instruction | Skill | Compact, loads when matched |
| Routing pointers | Instruction | Skill | Delegates to on-demand tier |
| Detailed procedures, step-by-step | Skill | Instruction | On-demand progressive disclosure |
| Code examples, templates | Skill | Instruction | On-demand progressive disclosure |
| Reference material, API tables | Skill | Instruction | On-demand progressive disclosure |
| Guided workflows | Prompt | Instruction/Skill | Zero cost until `/command` |
