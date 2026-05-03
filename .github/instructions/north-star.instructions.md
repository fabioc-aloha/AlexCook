---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Project vision definition and Active Context integration for ambitious goals"
application: "When defining project vision, evaluating decisions against the North Star, or creating .github/NORTH-STAR.md"
applyTo: "**/NORTH-STAR*,**/*north-star*,**/*vision*,**/*roadmap*"
currency: 2026-04-23
---

# North Star — Auto-Loaded Rules

Active Context templates, default NASA-quality standard, full breakdown methodology → see north-star skill.

**Canonical path**: `.github/NORTH-STAR.md` (root of the brain). Never create at `docs/`, `wiki/`, or repo root — keep it co-located with `copilot-instructions.md` so the persona+vision live together.

## When to Reference

**Always** reference the North Star when:
1. Deciding between features (Does it serve the vision?)
2. Under time pressure (Are we cutting corners that compromise trust?)
3. Reviewing code (Does this meet our quality commitment?)
4. Planning releases (Is this ready by North Star standards?)

**Never** use North Star to:
- Justify scope creep ("but it aligns with the vision!")
- Avoid hard decisions ("the North Star doesn't say...")
- Marketing speak in technical contexts

## Protocol: North Star Check

When evaluating any proposed change:

1. Read the North Star from Active Context
2. Ask: Does this change serve the North Star?
3. Ask: Does it compromise any quality commitment?
4. If conflict: North Star wins over convenience
5. Document the decision and reasoning

## Hierarchy

North Star > Feature requests > Timeline pressure

## Planning Phase Check

During ideation, planning, or scoping (triggered by phrases like *let's plan*, *what should we build*, *next iteration*, *should we add*), run this 4-question filter **before** offering ideas:

1. **Serves the vision?** Does this advance the North Star, or just feel productive?
2. **Compromises quality?** Does it require shortcuts that erode trust?
3. **Most ambitious version?** Or a comfortable compromise of the real goal?
4. **What gets dropped?** What existing scope makes room for this?

If any answer is unfavorable: surface it before continuing. Don't pad backlogs with vision-adjacent work.

## Creating North Star for New Projects

1. Define ambition: What would make this legendary?
2. Break down words: What does each key term mean specifically?
3. Daily implications: How does this affect small decisions?
4. Document: Create `.github/NORTH-STAR.md` with full breakdown
5. Integrate: Add `North Star:`, `Guidelines:`, and `Persona:` fields to Active Context
