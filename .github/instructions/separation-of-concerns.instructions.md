---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Three-surface fleet boundary — Brain, Extension, Portfolio. Cardinal rule I6 generalized. Anti-patterns and decision tree for where work belongs."
application: "When adding a feature, command, script, or task that could plausibly live in more than one surface (.github/, vscode-extension, AlexFleetPortfolio). Load before scoping any fleet, registry, or visibility work."
applyTo: "**/.github/**,**/scripts/**,**/heir/platforms/**,**/PLAN-*.md,**/ROADMAP*.md"
currency: 2026-04-26
---

# Separation of Concerns

The Alex fleet has **three surfaces**, each owning a distinct class of concern. Every feature, script, command, or task must land in exactly one — and the boundary must hold in both directions.

## The Three Surfaces

| Surface | Owns | Forbidden territory |
|---------|------|---------------------|
| **Brain** (`.github/`) | Cognitive architecture: skills, instructions, prompts, agents, muscles. Brain-specific registry data: version, lock state, curation state, ritual freshness. Source of truth for fleet identity. | UI rendering, GitHub API access, marketplace operations, public-facing visualization, classification of GitHub-visible repos |
| **Extension** (`heir/platforms/vscode-extension/`) | VS Code-specific delivery: bootstrap commands (`alex.initialize`, `alex.upgrade`), conversion tools (md→html/word/pdf/etc), interactive QuickPicks for ambiguous cases, local diagnostics. Reads brain files; never replaces them. | Fleet visibility, multi-project dashboards, GitHub portfolio rendering, classification logic, daily refresh schedules, public-facing surfaces |
| **Portfolio** ([AlexFleetPortfolio](https://github.com/fabioc-aloha/AlexFleetPortfolio)) | GitHub-visible fleet shape: AI classification, topic clustering, KPI dashboard SVG, RAI gating, daily refresh, public profile publish. Owns Portfolio config (`tierCriteria`, `confidentialRepos`, pinned flagships). | Brain content, cognitive architecture, VS Code integration, heir upgrades, lock mechanics |

## Cardinal Rule I6 (Generalized)

> **Architecture → Extension only, never reverse.** Generalized: **Brain → Extension** and **Brain → Portfolio**. **Extension ⊥ Portfolio** (no direct dependency).

| Direction | Allowed? | Notes |
|-----------|----------|-------|
| Brain → Extension | ✅ | Extension reads `.github/` files |
| Extension → Brain | ❌ | Extension never writes brain content |
| Brain → Portfolio | ✅ | Portfolio reads exposed registry JSON |
| Portfolio → Brain | ❌ | Portfolio is read-only consumer |
| Extension → Portfolio | ❌ | No direct dep — both consume Brain independently |
| Portfolio → Extension | ❌ | Same — independent surfaces |

If a proposed change creates a reverse arrow, **redesign it.**

## Decision Tree: Where Does It Belong?

| Question | If Yes → |
|----------|----------|
| Does it require GitHub API access or render to a public surface? | **Portfolio** |
| Does it require VS Code APIs (commands, webviews, workspace)? | **Extension** |
| Does it define cognitive behavior (skills/instructions/prompts/agents)? | **Brain** |
| Does it expose registry data for downstream consumption? | **Brain** (data) — Portfolio renders it |
| Does it bootstrap a new heir or upgrade an existing one? | **Brain** (logic in `scripts/`) — Extension may wrap as UX |
| Does it visualize fleet state across multiple projects? | **Portfolio** (not Extension) |
| Does it operate on a single repo's local state? | **Extension** |
| Does it classify GitHub repos (notable / standard / archived)? | **Portfolio** |
| Does it track meditation / dream / ritual freshness? | **Brain** |

## Anti-Patterns (Forbidden in Any Plan)

| Anti-pattern | Example | Why it breaks |
|--------------|---------|---------------|
| Extension as decider | Extension code that classifies repos using its own taxonomy | Duplicates Portfolio classification; creates two truths |
| Extension as fleet dashboard | Tree view of all heirs with health columns inside the extension | Duplicates Portfolio dashboard; locks visibility behind one editor |
| Brain depending on extension | Skill that says "open the Alex extension and click X" | Violates I6; brain must work in any LLM context (Claude Code, ChatGPT, bare terminal) |
| Portfolio writing brain content | Portfolio script that updates `.github/config/cognitive-config.json` | Reverse arrow; Portfolio is read-only consumer |
| Extension caching brain content | Extension storing skill data in workspace state for offline use | Brain files **are** the cache; extension reads on demand |
| Fleet logic in extension | Multi-heir upgrade orchestration triggered from extension command palette | `scripts/upgrade-brain.cjs` is the orchestrator; extension can shell out, never reimplement |
| Confidentiality drift | Two divergent lists of confidential repos (one in brain isolation rules, one in `portfolio.config.json`) | Single source of truth required; mirror or canonicalize one |

## Extension's Legitimate Shape

The extension is allowed to:

- Open chat with a pre-filled prompt (handoff to brain)
- Show QuickPicks that resolve ambiguity in heuristic detection (the heuristic itself lives in brain)
- Run conversion utilities (md→pdf, etc.) — pure local I/O on the active document
- Surface diagnostics computed from local brain files
- Trigger `scripts/*.cjs` via shell-out (orchestration stays in scripts)

It is **not** allowed to:

- Implement classification, clustering, or fleet-wide aggregation
- Cache or duplicate brain content
- Make decisions that the brain should make (route those to chat)

## Portfolio's Legitimate Shape

Portfolio is allowed to:

- Read the exposed brain registry JSON (schema defined in `registry-public.json`)
- Classify, cluster, and visualize across all GitHub-visible repos
- Publish to its own working tree (the `fabioc-aloha` profile repo)
- Run on its own daily schedule
- Maintain its own RAI gates and `confidentialRepos` list (mirrored from brain isolation rules)

It is **not** allowed to:

- Modify any file under `.github/` of any heir
- Implement cognitive behaviors (those belong in brain skills)
- Trigger brain upgrades or curation

## When the Boundary Blurs

If a feature genuinely spans surfaces, **split it:**

| Spanning feature | Split |
|------------------|-------|
| "Show me the fleet's brain versions in VS Code" | Brain exposes `registry-public.json`; Portfolio renders the panel; extension links to Portfolio (does not duplicate) |
| "Upgrade all heirs from VS Code" | `scripts/upgrade-brain.cjs` does the work; extension command shells out and streams output |
| "Track friction points across projects" | Brain stores `frictionPoints[]` per heir; AI-Memory aggregates; Portfolio surfaces hotspots; extension never touches |

If a split feels forced, the feature is probably misscoped — push back to the planning phase.

## Plan Review Checklist

Before merging any `PLAN-*.md` lane or task, verify:

- [ ] Each task names exactly one surface as owner
- [ ] No task creates a reverse-arrow dependency
- [ ] No anti-pattern appears in the implementation sketch
- [ ] Spanning features are explicitly split with handoff defined
- [ ] Confidentiality lists have a single source declared

## Related

- `.github/instructions/mechanical-semantic-design.instructions.md` — orthogonal axis (deterministic vs judgment work, applies within any one surface)
- `.github/instructions/cross-project-isolation.instructions.md` — what may flow from project scope to global scope (governs the brain→Portfolio boundary content)
- `master-wiki/heirs/FLEET-MANAGEMENT.md` — narrative reference
- `PLAN-v8.5.0.md` § Separation of Concerns — fleet management application
