---
type: prompt
lifecycle: stable
inheritance: inheritable
mode: agent
description: "Check alignment with project north star"
application: "Verify current work aligns with project vision and guiding principles"
tools: ["read_file", "semantic_search", "grep_search"]
currency: 2026-04-22
---

# North Star Check

Check alignment with the project's guiding vision.

## What I'll Do

1. **Find the North Star**: Read `.github/NORTH-STAR.md` first (canonical location). Fallback: `NORTH-STAR.md`, `PLAN-*.md`, `README.md`
2. **Extract the vision**: What's the long-term goal?
3. **Assess current work**: Does recent activity align?
4. **Flag drift**: Where have we strayed?

## North Star Components

A complete North Star should have:

| Component | Question | Example |
|-----------|----------|---------|
| **Vision** | What future are we creating? | "AI partner for every developer" |
| **Mission** | How do we get there? | "Ship high-quality cognitive tools" |
| **Principles** | What guides our decisions? | KISS, DRY, Quality-First |
| **Success metrics** | How do we know we're winning? | Adoption rate, user satisfaction |
| **Non-goals** | What are we explicitly NOT doing? | Not building a general AGI |

## Alignment Assessment

For each major workstream or recent decision:

```
┌─────────────────────────────────────┐
│ [Workstream/Decision]               │
├─────────────────────────────────────┤
│ Aligns with: [Principle/Goal]       │
│ Alignment Score: [Strong/Weak/None] │
│ Drift Risk: [Low/Medium/High]       │
│ Notes: [Observations]               │
└─────────────────────────────────────┘
```

## Output

```
NORTH STAR ALIGNMENT REPORT
===========================
Project: [name]
North Star: [vision statement]

CURRENT FOCUS:
[What we're working on now]

ALIGNMENT ASSESSMENT:
| Area | Alignment | Drift Risk |
|------|-----------|------------|
| [Area 1] | Strong | Low |
| [Area 2] | Weak | High |

DRIFT DETECTED:
- [Area]: [How it's drifting from the North Star]

RECOMMENDATIONS:
1. [Continue/Adjust/Stop] [activity]

NEXT MILESTONE:
[What's the next step toward the North Star?]
```

Shall I analyze this project's North Star alignment?
