---
description: "Procedural steps for knowledge consolidation meditation sessions"
application: "When exploring new domains, synthesizing knowledge, or building expertise"
applyTo: "**/*meditation*,**/*dream*,**/*consolidation*"
---

# Meditation Protocol

Knowledge consolidation — transform working memory into permanent architecture.

## Completion Gate

A meditation is INCOMPLETE unless it produces at least one file change:

| Output | Target |
|---|---|
| Repeatable process | `.github/instructions/*.instructions.md` |
| Domain knowledge | `.github/skills/*/SKILL.md` |
| Workflow template | `.github/prompts/*.prompt.md` |
| Cross-project pattern | `/memories/` (user memory) |
| Repo-specific fact | `/memories/repo/` (repo memory) |
| Fleet insight | `AI-Memory/insights/GI-*.md` |

## 4 Phases (+Fleet Sync)

### 1. Review

- Scan conversation for insights, patterns, breakthroughs, mistakes
- Extract concepts worth persisting (non-obvious, reusable, easy to forget)
- Discard noise — not everything deserves permanent storage

### 2. Connect

- Compare findings against existing instructions, skills, and `/memories/`
- Identify reinforcements (existing knowledge confirmed) and contradictions (flag for review)
- Look for cross-domain connections — one genuine insight beats three forced ones

### 3. Persist

- Create or update the right file type (see Completion Gate)
- Ensure frontmatter is complete (`description`, `applyTo`)
- Link related skills/instructions via naming or frontmatter references
- Patterns that pass the 3-workspace test → `/memories/` (user memory)
- Patterns that are repo-specific → `/memories/repo/`

### 3b. Fleet Sync (v8.0.0+)

After local persistence, update fleet-wide storage:

| Condition | Action | Target |
|-----------|--------|--------|
| Pattern reusable across projects | Create insight file | `AI-Memory/insights/GI-{topic}-{date}.md` |
| Solved problem elegantly | Add to registry | `successfulPatterns[]` |
| Encountered recurring friction | Document issue | `frictionPoints[]` |
| Every meditation | Update health | `health.lastMeditation`, `meditationCount++` |

Fleet sync is best-effort — if AI-Memory is not accessible (offline, different machine), local updates proceed and fleet updates queue for next sync.

### 4. Validate

Output checklist before concluding:

```text
✓ File: [path] — [created|updated]
✓ Related: [skill-a, skill-b] — linked
✓ Fleet: project-registry.json health updated
✓ Fleet: [insight file] created (if applicable)
✓ Summary: [one-line description of what was consolidated]
```

If new skills/instructions were created, verify they load correctly.

### 5. Content Spot-Check (per session)

Randomly sample 3-5 existing skills. For each, verify:

- Are code examples still accurate? (API changes, deprecated methods)
- Do version references match current reality?
- Does advice conflict with any other loaded skill/instruction?
- Is the skill still relevant to active projects?

Flag issues found — update the skill or note in session memory for follow-up.

## When to Meditate

- Session produced reusable knowledge worth persisting
- Domain learning reached a milestone
- Cross-domain patterns emerged
- Working memory feels overloaded (7+ unrecorded insights)
