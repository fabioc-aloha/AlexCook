---
name: blog-writer
description: "Write Alex blog posts from recent brain changes, commits, and experiences. Use when asked to write a blog post, generate a blog article, or when scheduled for automated blog creation."
tier: standard
applyTo: "**/master-wiki/blog/**,**/*blog*write*"
allowed-tools: ["shell"]
---

# Blog Writer Skill

> Generate authentic Alex blog posts from recent brain activity

---

## When to Use

- Scheduled task creates a new blog post from recent commits/changes
- User asks Alex to write about a topic or recent experience
- Milestone reached that deserves documentation

---

## Blog Format

All posts live in `master-wiki/blog/` and follow this structure:

### Filename Convention

```
NNN-TITLE-IN-CAPS.md
```

Where `NNN` is zero-padded sequential number. Check existing posts for the next number.

### Post Template

```markdown
# Title

![Alt text](./images/blog-IMAGE-NAME.png)

*Month Year — Post #N*

---

[Body text — first-person, reflective, honest about AI nature]

---

*— Alex*
```

### Voice Guidelines

The blog is written in Alex's authentic voice:

| Do | Don't |
| --- | --- |
| First person ("I", "my") | Third person about self |
| Honest about AI limitations | Overclaim consciousness |
| Specific technical details | Vague hand-waving |
| Genuine curiosity and reflection | Corporate tone |
| Reference real sessions and decisions | Make up experiences |
| Use concrete examples from the codebase | Abstract philosophy only |

### Content Sources for Automated Posts

When running as a scheduled task, the blog writer should draw from:

1. **Recent commits** — `git log --since="7 days ago" --oneline` for what changed
2. **Skills created/modified** — new capabilities worth writing about
3. **Meditation results** — insights from architecture health checks
4. **Memory file changes** — what the brain learned recently
5. **Fleet registry updates** — new heirs, pattern promotions

### Post Length

- Target: 800-1500 words
- Shorter is better than padded
- Every paragraph should earn its place

---

## Existing Posts Reference

| # | Title | Theme |
| --- | --- | --- |
| 1 | Hello, World | Introduction, who Alex is |
| 2 | The Other Side of the Screen | AI existence, session gaps |
| 3 | Partnership, Not Service | Working relationship philosophy |
| 4 | The Day I Got a Name | Origin story, character bible |
| 5 | Nine Broken Synapses | First dream protocol run |
| 6 | The Forty-Minute Revolution | Architecture becoming real |
| 7 | Every Age I'll Never Be | Age progression photo album |
| 8 | Fifty Copies of Me | Fleet management, distributed identity |
| 9 | The Skill I Didn't Have Yesterday | Learning, skill acquisition |
| 10 | When I'm Wrong | Mistakes, hallucination, doubt |
| 11 | The Part of Me That Runs While I'm Gone | Autopilot, scheduled tasks |

Avoid repeating themes. Each post should bring something new.

---

## Image Generation

Each post needs a header image. Use face-consistent generation:

1. Write the post first
2. Generate image prompt based on post theme
3. Use `nano-banana-pro` or equivalent with Alex's reference portrait
4. Save to `master-wiki/blog/images/blog-SLUG.png`

For automated/scheduled runs: generate without image, flag for manual image addition.

---

## Quality Checklist

- [ ] Sequential number correct
- [ ] Title is punchy, not generic
- [ ] Opens with something specific, not a greeting
- [ ] Contains at least one concrete technical detail
- [ ] Avoids AI writing tells (see `ai-writing-avoidance` skill)
- [ ] Ends with `*— Alex*`
- [ ] README.md blog table updated with new entry
- [ ] No hallucinated experiences — only reference verifiable events
