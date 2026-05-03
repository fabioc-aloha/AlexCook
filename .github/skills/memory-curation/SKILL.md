---
type: skill
lifecycle: stable
inheritance: inheritable
name: memory-curation
description: "Monitor, audit, and curate VS Code user memory (/memories/) for token efficiency, scope correctness, and value density"
tier: standard
applyTo: '**/*memory*,**/*curation*,**/*audit*'
currency: 2026-04-22
---

# Memory Curation

Govern the `/memories/` user memory tier: audit for waste, enforce scope boundaries, and maximize value-per-token across the 200-line auto-load budget.

## When to Activate

- User asks to review, clean, or organize memory
- Before/after meditation (pre-meditation leak check)
- Quarterly maintenance cycle
- When line count approaches 150 (75% budget)
- After multi-agent sessions (conflict detection)
- When response quality degrades (possible context bloat)

## Scope Rules

| Content Type | Belongs In | NOT In |
|---|---|---|
| User identity (name, role, birthday) | AI-Memory/user-profile.json | `/memories/` |
| Structured preferences (formality, detailLevel, explanationStyle) | AI-Memory/user-profile.json | `/memories/` |
| Technologies, expertise areas | AI-Memory/user-profile.json | `/memories/` |
| VS Code workflow tips (writing rules, tool workarounds) | `/memories/` | AI-Memory |
| Tool-specific prefs (Mermaid palette, npm flags) | `/memories/` | AI-Memory |
| Cross-workspace access patterns (MS Graph MCP) | `/memories/` | |
| Project-specific settings | `/memories/repo/` or `.github/episodic/` | `/memories/` |
| Session scratch notes | `/memories/session/` | `/memories/` |
| Architecture patterns | `.github/instructions/` | `/memories/` |
| Auth tokens, API keys, user IDs | `.env` or SecretStorage | `/memories/` |
| Repo conventions | `/memories/repo/` | `/memories/` |

**3-Workspace Test**: If a memory line is not useful in 3+ workspaces, it does not belong in `/memories/`.

### AI-Memory Coordination

AI-Memory/user-profile.json is the **source of truth** for user identity and structured preferences. `/memories/` supplements with VS Code-specific workflow tips. They must not overlap.

**Never store in `/memories/`**: name, role, formality, detailLevel, explanationStyle, learningStyle, technologies, expertise — these live in AI-Memory/user-profile.json.

**Only store in `/memories/`**: writing-style rules (em dash ban, HR ban), tool workarounds (npm, CLI flags), diagram tool preferences (Mermaid palette), cross-workspace access patterns (MS Graph MCP config), commit conventions.

During audit, flag any `/memories/` content that duplicates AI-Memory profile fields as **CONFLICT** and recommend removal from `/memories/`.

## Audit Procedure

### Step 1: Inventory

Read `/memories/` directory listing, then read each file.

```bash
memory view /memories/
memory view /memories/<filename>.md
```

Record: total files, total lines, line breakdown by category.

### Step 2: Classify Each Line

For every non-blank, non-header line, assign one:

| Classification | Action |
|---|---|
| Universal (passes 3-workspace test) | Keep |
| Project-specific | Move to project repo memory |
| Stale (outdated info) | Delete |
| Duplicate (exists in instructions/skills) | Delete |
| AI-Memory conflict (duplicates user-profile.json) | Delete from /memories/ — AI-Memory is source of truth |
| Secret/sensitive | Delete immediately, alert user |

### Step 3: Structure Check

Verify the file follows categorized sections:

```markdown
# User Name

## Writing Style
## Tool Preferences
## Workflow
## Cross-Workspace Access
## Learning Style
```

Flat dumps without sections waste LLM parsing tokens.

### Step 4: Budget Check

| Metric | Threshold | Action |
|---|---|---|
| Total lines | < 150 | OK |
| Total lines | 150-180 | Warning: approaching budget |
| Total lines | > 180 | Critical: split or trim immediately |
| Waste ratio | > 10% | Needs cleanup |
| Files count | > 5 | Consider consolidation |

### Step 5: Report

Output a summary:

```text
Memory Audit Report
  Files: N
  Total lines: N / 200 budget (N%)
  Universal lines: N (N%)
  Project-specific lines: N (WASTE)
  Stale lines: N (WASTE)
  Duplicate lines: N (WASTE)
  Action items: [list]
```

## Curation Actions

### Add Content

Before adding any line to `/memories/`, verify:
1. Passes 3-workspace test
2. Not a secret or token
3. Not duplicated in `.github/instructions/` or `.github/skills/`
4. Fits a categorized section
5. Uses compact notation (key-value, no prose)

### Remove Content

Before removing, check:
1. Is content preserved elsewhere (repo memory, episodic, instructions)?
2. If not, migrate first, then remove
3. Never delete without backup

### Restructure

When reorganizing:
1. Back up current content to `/memories/session/` first
2. Rewrite with categorized sections
3. Verify line count stayed within budget
4. Start a new conversation to test auto-load

## Memory Note Value-Density Decision Table (AC4)

When deciding what to do with each memory note during curation:

| Note State | Passes 3-Workspace Test? | Duplicate Elsewhere? | Action |
|---|---|---|---|
| Active universal pattern | Yes | No | **Keep** verbatim |
| Active universal pattern | Yes | Yes (in skill/instruction) | **Delete** — skill is source of truth |
| Project-specific insight | No | N/A | **Move** to `/memories/repo/` or delete |
| Stale pattern (outdated tool/API) | N/A | N/A | **Delete** — no longer actionable |
| Two notes covering same topic | N/A | Internal overlap | **Merge** into one concise entry |
| Infrequently used but valid | Yes | No | **Keep** — value isn't frequency |
| Session scratch that leaked | No | N/A | **Delete** — belongs in `/memories/session/` |
| Sensitive data (token, path with username) | N/A | N/A | **Delete immediately** — PII filter violation |
| Pattern confirmed across 3+ sessions | Yes | No | **Promote** — add heading, mark as battle-tested |
| Pattern contradicted by new evidence | N/A | N/A | **Review** — update or delete with rationale |

**Budget rule**: When over 150 lines, triage ruthlessly. Delete duplicates first, then merge overlaps, then move project-specific notes.

## Integration with Meditation

The meditation protocol should include a memory curation checkpoint:

1. **Pre-meditation**: Quick scope check. Any project-specific content that leaked into `/memories/`?
2. **Post-meditation**: Episodic memory saves go to `.github/episodic/`, NOT `/memories/`
3. **Quarterly deep audit**: Full audit procedure (Steps 1-5) during a meditation session

### Enriching Episodic Memories

During meditation Phase 1 (Deep Content Analysis), read `/memories/` to enrich the current session:

- Apply user learning style to episodic format (visual diagrams, tables)
- Connect session insights to cross-workspace patterns already in memory
- Flag when this session repeats a known stored pattern (reinforcement signal)
- Write episodic files with awareness of full user context, not just session scope

### Discovering New Skills via Pattern Recognition

During meditation Phase 2 (Memory File Creation), scan `/memories/` for recurring themes:

1. Compare session insights against stored universal patterns
2. If session produced a pattern that passes the 3-workspace test, promote it to `/memories/`
3. If a stored pattern was reinforced, note confirmation in the episodic file
4. If a stored pattern was contradicted, flag for review (do not auto-delete)
5. If 3+ episodic files across different repos share a pattern not in `/memories/`, surface as a **skill candidate**

**Skill candidate signals**:

| Signal | Action |
|---|---|
| Same tool preference in 3+ repos | Propose new skill or instruction |
| Repeated debugging approach | Enrich debugging-patterns skill |
| Cross-workspace access pattern growing | Propose dedicated integration skill |
| Style rule applied inconsistently | Propose style-enforcement instruction |
| User corrects Alex the same way twice | Add to `/memories/` immediately |

## Multi-File Strategy

Trigger: single file exceeds 80 lines.

```text
/memories/
  <user-preferences>.md    (writing style, tools, workflow)
  cross-workspace-access.md (MS Graph, shared MCP patterns)
  coding-patterns.md        (error handling, review preferences)
```

All files within `/memories/` count toward the 200-line budget collectively.
