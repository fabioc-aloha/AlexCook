---
description: "Structured postmortem writing for production incidents — root cause, timeline, and prevention"
application: "When documenting production incidents, regressions, or outages that escaped to users"
applyTo: "**/*incident*,**/*postmortem*,**/*outage*"
---

# Postmortem Writing

Structured analysis of production incidents to capture root causes and prevent recurrence.

## Template Structure

1. **Summary** — One-paragraph incident description
2. **Impact** — Users affected, duration, severity level
3. **Timeline** — Chronological events from first signal to resolution
4. **Root Cause** — Technical cause chain (not "human error")
5. **Contributing Factors** — What made detection/resolution slower
6. **Action Items** — Prioritized preventive measures with owners and deadlines
7. **Lessons Learned** — What worked, what didn't, what was lucky

## Key Rules

- Blameless — focus on systems, not individuals
- Root cause must be a design flaw, not "someone made a mistake"
- Every action item needs an owner and a deadline
- Only write a postmortem when the incident reveals a novel failure mode

## Skill Reference

Full methodology in `.github/skills/postmortem/SKILL.md`.
