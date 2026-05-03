---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Global knowledge management and AI-Memory location reference"
application: "When managing cross-project knowledge or AI-Memory artifacts"
applyTo: "**/AI-Memory/**,**/*global-knowledge*"
currency: 2026-04-22
---

# Global Knowledge Management

Full protocol in `.github/skills/global-knowledge/SKILL.md`.

## Quick Reference

| Data | Location | Scope |
|------|----------|-------|
| Name, role, identity | AI-Memory/user-profile.json | All projects |
| Preferences (style, learning) | AI-Memory/user-profile.json | All projects |
| Cross-project patterns | AI-Memory/global-knowledge.md | All projects |
| Session notes | AI-Memory/notes.md | All projects |
| Learning goals | AI-Memory/learning-goals.md | All projects |
| Fleet visibility | AI-Memory/project-registry.json | All projects |
| Project persona | .github/config/project-persona.json | One project |

## AI-Memory Promotion Boundary (SK2)

Before writing to any `AI-Memory/` location from project context, evaluate this gate. This enforces `cross-project-isolation.instructions.md` stripping rules as a pre-write decision table rather than relying on the author to remember them.

| # | Check | Pass | Fail | Action on Fail |
|---|-------|------|------|----------------|
| 1 | **Scope classification** — content is global-safe (technology names, abstract patterns, tool gotchas) | No project-specific context required to understand | References specific project structure, client data, or internal team names | Strip per cross-project-isolation rules; re-evaluate |
| 2 | **PII filter** — passes `pii-memory-filter.instructions.md` self-check | No contact info, health data, financial data, credentials, or usernames in paths | Any PII category present | Do not write; strip PII first or redirect to appropriate tier |
| 3 | **Cross-project stripping** — file paths, project names, client names, domain entities, repo URLs all removed | Generic references only ("a service handler", "a workspace management project") | Identifiable project context survives | Apply stripping rules from `cross-project-isolation.instructions.md` |
| 4 | **Multi-project threshold** — pattern observed in 2+ independent contexts (for patterns/) | "Observed in N projects" (count, don't enumerate) | Single project observation | Hold as local insight; promote after second sighting |
| 5 | **No cross-reference** — patterns don't link observations across named projects | "Observed in 3 projects" | "Observed in ProjectA and ProjectB" | Remove project identifiers; use count only |
| 6 | **Code snippets ≤5 lines** — longer snippets leak project architecture | Short illustrative examples | Extended code blocks with project-specific structure | Trim or replace with pseudocode |
| 7 | **Decision log entry** — promotion logged via PE1 decision log with `promotedFrom` provenance | `logPhase2Decision()` called with skill, rationale, actor | No audit trail for the promotion | Log before writing; every global-scope write must be traceable |

**Gate rule**: All 7 rows must pass. Failing any row = do not write to `AI-Memory/`. Fix the failing condition first, then re-evaluate.
