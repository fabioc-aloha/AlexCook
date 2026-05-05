---
type: skill
lifecycle: stable
inheritance: inheritable
name: currency-audit
description: Comprehensive brain file review — external freshness, internal consistency, semantic accuracy — stamp only after full assessment
tier: core
applyTo: '**/.github/quality/*,**/.github/skills/**,**/.github/instructions/**,**/.github/prompts/**,**/.github/agents/**,**/.github/muscles/**'
currency: 2026-04-20
---

# Currency Audit

> Full assessment: external freshness + internal consistency + semantic accuracy. Stamp only when all pass.

brain-qa.cjs checks the **date** mechanically. This skill defines the **full review** that earns that date. A currency stamp means both "content matches external reality" AND "content is internally consistent."

---

## Critical Thinking Discipline

Every audit item must pass through critical thinking — not just mechanical verification. Apply these disciplines throughout:

| Discipline | Application to Currency Audit |
|---|---|
| **Alternative hypotheses** | "This API exists" isn't enough — is the *usage* correct? Could the documented pattern be outdated even if the API isn't? |
| **Missing data** | What's NOT in the file that should be? Missing caveats, undocumented prerequisites, absent error handling? |
| **Evidence quality** | Is the file's advice based on official docs, or a single blog post from 2021? |
| **Self-report skepticism** | "Best practice" claims — verified against what source? "Works on current versions" — actually tested? |
| **Bias detection** | Anchoring on the file's current content. Challenge: would you write this the same way from scratch today? |
| **Falsifiability** | What would prove this advice wrong? If nothing could, the claim may be unfalsifiable hand-waving |
| **Materiality gate** | If this item were stale, would it cause real harm? Prioritize fixes that affect decisions over cosmetic accuracy |

**The key question at every checklist item**: "Am I verifying this is correct, or am I assuming it's correct because it looks plausible?"

---

## Skill Tier Definitions

Every skill must declare a `tier:` in frontmatter. Three valid tiers exist. During currency audit, validate the tier assignment against these criteria.

### Core

Skills that apply to **virtually every task** or are **safety-critical**. Failure to apply creates risk of harm or quality degradation.

**Decision test**: "Would skipping this skill on any arbitrary task create risk of incorrect, unsafe, or low-quality output?"

**Characteristics**:

- Always-on or near-universal activation (`applyTo: "**"` or very broad patterns)
- Epistemic integrity (anti-hallucination, awareness, critical-thinking)
- Code quality fundamentals (code-review, testing-strategies, debugging-patterns)
- Safety gates (security-review, terminal-command-safety)
- Platform essentials (git-workflow, vscode-extension-patterns)
- Brain maintenance (currency-audit, memory-activation, north-star)

**Count guideline**: ~20-30 skills. If core exceeds 30, some are likely standard.

### Standard

Skills for **recognized professional domains** used across many projects. Activated by pattern matching on specific file types or keywords.

**Decision test**: "Does this skill serve a common professional domain that many different projects would benefit from?"

**Characteristics**:

- Domain-specific but broadly applicable (API design, Azure patterns, data analysis, dashboard design)
- Activated by file patterns or domain keywords, not universally
- Would be useful in >25% of heir projects
- Has a matching instruction (trifecta complete)

**Count guideline**: ~100-120 skills. The largest tier — the working library.

### Extended

Skills for **specialized, niche, or personal** use cases. Narrow audience or uncommon workflows.

**Decision test**: "Does this skill serve a narrow audience, a single project, or an uncommon use case?"

**Characteristics**:

- Specialized domains (academic writing, KDP publishing, game design, comedy writing)
- Personal tools (correax-brand, alex-character, dissertation-defense)
- Rare workflows (fabric-notebook-publish, terminal-image-rendering)
- Would be useful in <25% of heir projects
- May lack trifecta (instruction not needed for rare activation)

**Count guideline**: ~50-60 skills. If extended exceeds 60, consider whether some should be standard.

### Invalid Tiers

No other tier values are valid. During audit, fix any stray values (`advanced`, `expert`, etc.) to the correct tier per the decision tests above.

---

## When to Use

- brain-health-grid shows files with expired or missing currency dates
- Before a release that ships brain files to heirs
- On a scheduled cadence (target: full audit every 90 days)
- After a major external change (new API version, deprecated pattern, VS Code update)

---

## Quick Reference

| Step | Action | Outcome |
|------|--------|---------|
| **Triage** | Run `node .github/muscles/brain-qa.cjs`, read Priority Queue | Ordered work list |
| **Research** | Check latest docs, changelogs, releases for the file's domain | Delta list |
| **Compare** | Diff current content against latest practices | Stale advice identified |
| **Audit** | Check terminology, cross-references, claims, process logic | Internal consistency verified |
| **Update** | Fix stale content, wrong terms, broken references, contradictions | Full assessment complete |
| **Stamp** | Set `currency: YYYY-MM-DD` to today in frontmatter | Pass restored |
| **Verify** | Re-run brain-qa, confirm file passes | Green grid |

---

## Audit Process

### 1. Triage

Generate the grid and read the Priority Queue:

```bash
node .github/muscles/brain-qa.cjs
```

The Priority Queue in `.github/quality/brain-health-grid.md` is sorted: failing first, then missing currency, then oldest. Work top-down.

**Batch size**: 10-15 files per session. Larger batches cause quality drift.

### 2. Per-File Review Checklist

For each file, work through this checklist:

#### Frontmatter Check

- [ ] `currency` field exists and is a valid `YYYY-MM-DD` date
- [ ] `description` accurately reflects current content (not stale summary)
- [ ] `applyTo` patterns still match the intended activation scope
- [ ] `tier` value is one of `core`, `standard`, `extended` — no other values allowed
- [ ] `tier` assignment passes the correct decision test (see Skill Tier Definitions above)
- [ ] Type-specific fields present (see brain-qa grid for requirements)

#### Content Freshness Check

- [ ] **API references**: Do referenced APIs still exist? Check for deprecations, renamed methods, new parameters
- [ ] **Version numbers**: Are pinned versions still current? (Node.js, VS Code API, Azure SDKs, etc.)
- [ ] **URL links**: Do referenced URLs still resolve? Are they the canonical location?
- [ ] **Best practices**: Has the community consensus changed? Check official docs, changelogs
- [ ] **Tool availability**: Are referenced CLI tools, extensions, or services still available?
- [ ] **Code examples**: Do code snippets still compile/run against current versions?

#### Semantic Consistency Check

- [ ] **Terminology**: File uses current terms, not deprecated synonyms (e.g., "skills" not "DK files", "skills/" not "domain-knowledge/")
- [ ] **Claims match reality**: Do documented features, commands, or capabilities actually exist in code?
- [ ] **Cross-references**: Links to other skills, agents, instructions, or files are correct and targets exist
- [ ] **No contradictions**: File doesn't conflict with related files covering the same topic
- [ ] **Process logic**: If the file documents a workflow, each step's prerequisites exist and outputs are real
- [ ] **Architecture alignment**: Any structural claims (counts, relationships, directory layouts) match current state

#### Structural Check

- [ ] **No token waste**: Remove Mermaid diagrams in non-teaching skills, redundant examples, excessive prose
- [ ] **Progressive disclosure**: Most important info first, advanced topics later
- [ ] **Actionable content**: Every section helps the LLM produce better output

#### Inheritance Check (skills only)

- [ ] If `inh=1` (master-only): verify file is listed in `.github/config/MASTER-ALEX-PROTECTED.json`
- [ ] If `inh=0` (inheritable): verify no master-specific content (Master Alex references, workspace paths)

### 3. Update and Stamp

**Stamp only after ALL checklist sections pass** — frontmatter, freshness, semantic consistency, structural, and inheritance. A partial review does not earn a date stamp.

1. Make all content fixes (freshness + semantic + structural)
2. Update `currency: YYYY-MM-DD` in frontmatter to today's date
3. If the file's `description` changed meaning, update it

### 4. Verify

Re-run brain-qa to confirm the file now passes:

```bash
node .github/muscles/brain-qa.cjs --stdout | grep "filename"
# PowerShell: node .github/muscles/brain-qa.cjs --stdout | Select-String "filename"
```

---

## Type-Specific Guidance

### Skills

| Check | What to Verify |
|-------|---------------|
| **Domain accuracy** | Does the skill reflect current state of its domain? |
| **Trifecta link** | If workflow skill, does matching `.instructions.md` exist and align? |
| **Reference files** | Are `references/` or `scripts/` subdirectories still accurate? |
| **Examples** | Do code examples work with current tool versions? |

### Instructions

| Check | What to Verify |
|-------|---------------|
| **Routing accuracy** | Does `application` field match when this instruction should load? |
| **Skill reference** | If instruction references a skill, is the skill still current? |
| **Rule validity** | Are the rules still correct given current tooling? |

### Agents

| Check | What to Verify |
|-------|---------------|
| **Model availability** | Is the specified model still available and appropriate? |
| **Tool references** | Do referenced tools still exist in the extension? |
| **Handoff targets** | Do handoff agent names match actual agent files? |

### Prompts

| Check | What to Verify |
|-------|---------------|
| **Agent reference** | Does the `agent` field point to an existing agent? |
| **Workflow steps** | Are the prompted steps still valid for current tools? |

### Muscles

| Check | What to Verify |
|-------|---------------|
| **Runtime compatibility** | Does the script run without errors on current Node.js? |
| **Dependencies** | Are `@requires` dependencies still available? |
| **Output format** | Does the output match what consumers expect? |
| **Dead code** | Variables computed but never stored/used? Branches that can never match? Fields extracted but never displayed? |

---

## Batch Audit Workflow

For auditing many files efficiently:

1. **Sort by category**: Group files by domain (Azure, VS Code, testing, etc.) so research carries across files
2. **Research once per domain**: Check the domain's latest changelog/release notes once, apply to all files in that domain
3. **Parallel reads**: Read 5-6 files at once, note which need changes, then edit in sequence
4. **Stamp in bulk**: After verifying all changes, stamp dates. Use brain-qa to confirm all pass

---

## Common Findings

| Finding | Fix |
|---------|-----|
| Deprecated API method | Replace with current equivalent, cite migration guide |
| Stale version pin | Update to current stable version |
| Dead URL | Find new canonical URL or remove reference |
| Outdated best practice | Revise to current recommendation with rationale |
| Master-only content in inheritable file | Move to master-only file or gate behind `inh` check |
| Redundant Mermaid diagram | Replace with concise prose description |
| Missing `currency` field | Add field with today's date after completing review |

---

## Stale File Decision Table (AC2)

When a file's currency stamp is expired or missing, decide before acting:

| Condition | Content Changed? | Action | Stamp? |
|---|---|---|---|
| Stamp expired, content still accurate | No | Re-stamp unchanged | Yes — review confirmed validity |
| Stamp expired, minor drift (terminology, links) | Yes — minor | Edit then re-stamp | Yes — after fixes land |
| Stamp expired, material staleness (deprecated APIs, wrong patterns) | Yes — major | Full rewrite of stale sections, then stamp | Yes — after full review |
| Stamp missing, file is active and current | N/A | Add stamp with today's date | Yes — review confirms currency |
| Stamp expired, file covers a dead domain (sunset API, retired tool) | N/A | Mark `lifecycle: deprecated` + add `supersededBy` if successor exists | No — deprecated files don't get stamped |
| Stamp expired, file is historical record (plan, ADR, postmortem) | N/A | Mark `lifecycle: stable` with long reviewEvery (or exempt) | Yes — stamp means "confirmed intentionally historical" |
| Stamp expired, `lifecycle: external-dependent` | Check upstream | Research latest upstream docs before deciding | Only after upstream verification |
| Stamp expired, `lifecycle: experimental` | Check if promoted | Decide: promote to evolving, archive, or keep experimenting | Only if keeping active |

**Rule**: Never re-stamp without reviewing. A stamp is an attestation, not a date bump.

## Semantic Obsolescence Review Queue (FM5)

When a brain file's currency window elapses or it enters the lifecycle warning band, it enters the **review queue** (`.github/quality/review-queue.jsonl`). The queue is the bridge between mechanical detection ("this file is overdue") and semantic judgment ("should this be updated, archived, or re-stamped?").

### Queue Entry Schema

Each line in `review-queue.jsonl` is a JSON object:

```json
{
  "file": ".github/instructions/example.instructions.md",
  "reason": "currency-expired",
  "lifecycle": "stable",
  "currency": "2025-11-15",
  "daysSinceCurrency": 158,
  "reviewEvery": 90,
  "addedAt": "2026-04-25T12:00:00Z",
  "status": "pending"
}
```

### Queue Entry Reasons

| Reason | Trigger | Priority |
|--------|---------|----------|
| `currency-expired` | `daysSinceCurrency > reviewEvery` | Medium |
| `lifecycle-warning` | Within warning band (FM8a) but not expired | Low |
| `manual-flag` | Operator or LLM explicitly adds file for review | High |
| `heir-feedback` | Heir feedback references this file as problematic | High |
| `drift-detected` | Sync drift report or audit found material inconsistency | High |

### Queue Review Decision Table

| # | Check | Pass | Fail | Action on Fail |
|---|-------|------|------|----------------|
| 1 | **Content still accurate** — file content matches current codebase reality | Claims verified against code; no stale references | Contains references to renamed files, removed features, or outdated patterns | Update content; re-stamp currency |
| 2 | **Still relevant** — the capability this file documents is still active | Feature/pattern actively used in codebase | Feature deprecated, pattern abandoned, or superseded by newer approach | Transition to `deprecated` lifecycle; add supersededBy reference |
| 3 | **No upstream drift** — for `external-dependent` files, upstream API/tool hasn't changed | Upstream docs match file content | Upstream has breaking changes or new versions | Update file to match upstream; document version pinned to |
| 4 | **Heir impact assessed** — if file syncs to heirs, changes won't break heir workflows | Changes are additive or backward-compatible | Changes would break heir-side behavior or conventions | Phase change through heir sync dry-run (HS4) first |
| 5 | **Re-stamp justified** — if re-stamping without content change, rationale documented | "Reviewed, still current" with specific verification evidence | Rubber-stamp date bump with no review | Refuse re-stamp; add specific finding or update content |
| 6 | **Decision logged** — review outcome recorded in PE1 decision log | `logPhase2Decision()` called with review outcome + rationale | File exits queue with no audit trail | Log decision before changing queue status |

### Queue Status Lifecycle

```text
pending → in-review → resolved (updated | re-stamped | deprecated | archived)
                   → deferred (with rationale + re-review date)
```

### Integration Points

- **brain-qa.cjs**: Scans currency stamps → adds `currency-expired` entries to queue
- **FM8a** (lifecycle currency windows): Feeds `lifecycle-warning` entries
- **FM10** (health metric): Reads queue length as a health signal
- **Heir feedback**: `heir-feedback` entries added when feedback references specific files

## Related Skills

- [doc-hygiene](../doc-hygiene/SKILL.md) — Anti-drift rules for living documents
- [token-waste-elimination](../token-waste-elimination/SKILL.md) — Reduce token cost in brain files
- [documentation-quality-assurance](../documentation-quality-assurance/SKILL.md) — 6-pass quality pipeline for user-facing docs (broader scope than brain files)
