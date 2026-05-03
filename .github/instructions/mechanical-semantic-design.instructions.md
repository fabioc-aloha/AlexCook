---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "Mechanical/semantic split design contract — classify trifectas, route handoffs, prevent silent failures"
application: "When designing or reviewing any trifecta (skill+instruction+muscle), extension command, or pipeline that combines deterministic and judgment work"
applyTo: "**/.github/skills/**,**/.github/muscles/**,**/.github/instructions/**,**/.github/prompts/**,**/scripts/**,**/heir/platforms/**"
currency: 2026-04-26
---

# Mechanical / Semantic Design

Every capability has a **mechanical half** (deterministic, script-enforced) and a **semantic half** (judgment, LLM-led). The handoff between them is the product. Apply this lens to every trifecta, command, and pipeline.

**Full reference**: `master-wiki/architecture/MECHANICAL-SEMANTIC-PARADIGM.md` (master-only — not bundled with heirs). This instruction is the runtime design checklist — load when designing or reviewing the split.

## Classification Codes

| Code | Meaning | Example |
|------|---------|---------|
| **M** | Purely mechanical — deterministic, regression-testable | `bump-version.cjs`, file copy, schema check |
| **S** | Purely semantic — judgment-only, LLM-led | "Is this blog post in Alex's voice?" |
| **H** | Hybrid — mechanical core produces artifact, semantic pass consumes it | `brain-upgrade` with `.backup.md` handoff |
| **H-silent** | Hybrid in design, handoff missing or hidden | ⚠️ **bug** — surface as a tracked task |
| **M-guessing** | Mechanical in implementation, making judgment calls silently | ⚠️ **bug** — needs explicit user/LLM veto path |

## Severity Keys

| Severity | Meaning | When to apply |
|---|---|---|
| 🔴 **Critical** | Silent data loss or identity drift possible | Stop everything, fix before next operation |
| 🟠 **High** | User left without a clear next action after non-trivial work | Fix in current cycle |
| 🟡 **Medium** | Semantic work happens but with weak prompts (freeform, not decision tables) | Track as debt; convert to decision table |
| 🟢 **Low** | Correct, but could be hardened with checklists | Backlog candidate |

## The Five Operating Principles

1. **Neither half is automatically safe.** Apply critical thinking to both. For mechanical: "what edge case does this miss?". For semantic: "what does the decision table look like?". Scripts miss nuance; LLMs are inconsistent.
2. **The handoff is the product.** A muscle that runs and ends in silence is a bug even if it executes correctly. The user must know what comes next.
3. **Semantic decisions belong in decision tables**, not freeform prompts. The LLM gets a checklist; not a blank page.
4. **When in doubt, preserve.** `.backup.md` / `.backup.json` patterns are cheaper than guessing wrong.
5. **Parity checks catch drift.** When the same contract lives in two places (TS + CJS, master + heir, MCP + VS Code), a preflight check must fail loud when they diverge.

## Handoff Patterns

When a mechanical step completes and a semantic step must follow:

| Pattern | When to use | How it surfaces |
|---------|-------------|-----------------|
| **Exit code 2** | Muscle finishes successfully but produced artifacts that need LLM review | Platform wraps with `muscleAndPrompt()`; user sees notification + chat handoff |
| **`.backup.md` file** | Mechanical step would have overwritten content needing judgment to merge | Platform scans for `.backup.md`, offers Phase 2 review |
| **`.report.json` file** | Mechanical scan produced findings that need triage | Skill's decision table consumes the report |
| **Decision-log entry** | LLM acted on a `.backup.md` or report | Append to `.github/quality/phase2-decisions.jsonl` via `logPhase2Decision()` |

## Design Checklist for New Trifectas

When creating or auditing a trifecta, walk through:

| Question | If yes → | If no → |
|----------|----------|---------|
| Does the muscle make ANY judgment calls (priorities, thresholds, "is this acceptable")? | Move judgment to a skill decision table; muscle returns data only | Pure mechanical — no semantic layer needed |
| Does the muscle modify files the user/heir might want to keep? | Write `.backup.md` before overwrite; surface via exit code 2 | Direct write is fine |
| Does the muscle produce findings someone must triage? | Emit `.report.json`; skill provides decision table for triage | Plain stdout summary is enough |
| Is there a TS↔CJS or master↔heir mirror of this contract? | Add a parity check to release preflight | No parity test needed |
| Could a future platform invoke this muscle? | Verify it follows the cross-platform muscle contract (no platform APIs, exit-code contract, stdout/stderr discipline) — see `master-wiki/architecture/CROSS-PLATFORM-MUSCLE-CONTRACT.md` for the full spec | Document why it's platform-specific |
| Will the LLM make recurring decisions on this artifact? | Decision table with explicit rows; never freeform prompt | Single judgment with critical-thinking stance is acceptable |

## Anti-Patterns to Catch

| Anti-pattern | Why it breaks the paradigm |
|--------------|----------------------------|
| Muscle that "auto-decides" without user veto path | M-guessing — judgment hidden in code |
| Skill Phase 2 section written as narrative paragraph | Semantic decisions need a decision table, not prose |
| Extension command exits silently after writing files | H-silent — handoff missing |
| Two implementations of same contract (TS + CJS) without parity test | Drift will happen; only a question of when |
| Muscle imports platform SDK (VS Code, MCP, etc.) | Cardinal Rule violation — architecture must not depend on platform |
| Phase 2 prompt that doesn't reference a named skill | Freeform prompts produce inconsistent decisions |

## Integration With Other Instructions

- **`learned-patterns.instructions.md`** → Architecture section captures concrete gotchas; this instruction codifies the design rule those gotchas led to
- **`critical-thinking.instructions.md`** → The "challenge assumptions" lens that both halves require
- **`epistemic-calibration.instructions.md`** → Confidence calibration when a semantic decision is uncertain
- **`afcp-mission-coordination.instructions.md`** → Mission unknowns and delegations follow the same handoff principles

## When to Load

This instruction's `applyTo` covers brain authoring surfaces. It loads automatically when editing skills, muscles, instructions, prompts, or platform integration code. If you're outside those paths but designing a new automated→judgment handoff, load it manually.
