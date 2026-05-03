---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
description: "Structured meeting capture and organization"
application: "Capture meeting notes with decisions, actions, and follow-ups"
tools: ["create_file", "read_file"]
currency: 2026-04-22
---

# Meeting Notes

Capture and organize meeting notes with clear actions.

## During the Meeting

I'll help you capture:

- **Key points** (not verbatim — what matters)
- **Decisions made** (with rationale)
- **Action items** (who, what, when)
- **Open questions** (parked for later)
- **Insights** (aha moments, new understanding)

## Meeting Template

```markdown
# [Meeting Title]

**Date**: [YYYY-MM-DD]
**Time**: [HH:MM] - [HH:MM] ([duration])
**Attendees**: [names]
**Meeting Type**: [standup / 1:1 / planning / review / decision]

---

## Agenda

1. [Topic 1]
2. [Topic 2]
3. [Topic 3]

---

## Notes

### [Topic 1]

[Key points discussed]

**Decision**: [if any]
**Rationale**: [why]

### [Topic 2]

...

---

## Action Items

| Owner | Action | Due |
|-------|--------|-----|
| [Name] | [Task] | [Date] |

---

## Decisions Made

| Decision | Rationale | Decider |
|----------|-----------|---------|
| [What] | [Why] | [Who] |

---

## Open Questions

- [ ] [Question 1] — [Owner to follow up]
- [ ] [Question 2]

---

## Next Meeting

**Date**: [Date]
**Focus**: [Topics]
```

## Meeting Types

| Type | Focus | Typical Duration |
|------|-------|------------------|
| **Standup** | Blockers, progress | 15 min |
| **1:1** | Coaching, feedback | 30-60 min |
| **Planning** | What to do next | 60-90 min |
| **Review** | What we did | 30-60 min |
| **Decision** | Choose a path | 30-60 min |

## Best Practices

- **Start with the end**: What decisions need to be made?
- **Capture decisions in real-time**: Don't wait until the end
- **Name action owners explicitly**: "Someone should..." = no one will
- **Time-box topics**: Prevent runaway discussions
- **End early if possible**: Respect everyone's time

Paste your raw notes or tell me about the meeting:
