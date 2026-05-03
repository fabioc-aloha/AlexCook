---
type: prompt
lifecycle: stable
inheritance: inheritable
description: Report → Validate → Approve loop for non-trivial refactors and architecture changes
mode: agent
application: "When a change spans multiple files / trifectas / executors and deserves explicit sign-off before it ships"
agent: Alex
currency: 2026-04-23
---

# /propose-change — Structured Change Proposal Loop

A lightweight governance ritual for changes that are too big for a single commit message
but too small for a full ADR. Produces a plain-text proposal the user can read, annotate
inline, and sign off on — then archives the artifact as a decision record.

This is **the Loop in action**: IDEATE (working notes) → PLAN (proposal) → BUILD (inline
resolutions) → TEST (critical thinking / falsifiability) → RELEASE (approval stamp) →
IMPROVE (archive + template reuse).

## When to Use

Invoke this when the change touches any of:

- A trifecta (skill + instruction + muscle) or multiple executors of the same contract
- Shared core modules that other surfaces mirror (e.g. TS mirrors of CJS cores)
- Upgrade, publish, sync, or release pipelines
- Anything with a non-obvious rollback path

Do **not** invoke for single-file edits, typo fixes, or clearly-scoped bug repairs.

## The Loop

### 1. Working notes (IDEATE)

Create `UPGRADE-PROCEDURE-WORKING-NOTES.txt` (or equivalent name for the change).
Dump raw thinking: the problem, candidate designs, discarded alternatives, known
unknowns. No structure required — this is scratch space.

### 2. Proposal (PLAN)

Create a sibling file: `<CHANGE>-PROPOSED.txt`. Use plain text, not markdown, so
the user can annotate inline with `A:` lines without worrying about formatting.

Required sections:

1. **Summary** — one paragraph, what changes and why
2. **Phase N** sections — numbered, exhaustive steps of the mechanical work
3. **Per-project / per-surface flow** — operator mental model
4. **Contract / invariants** — what must remain true after the change
5. **Critical thinking** — apply `critical-thinking.instructions.md`:
   - Alternative hypotheses considered and rejected
   - Open questions (Qn, prefixed for inline answers)
   - Residual risks (Rn) with mitigation candidates
   - Falsifiability tests — how we'd know this design is wrong
6. **Approval checklist** — numbered `[ ]` items the user ticks to sign off
7. **On approval** — what the agent will do once signed off (rename working
   notes to `.superseded.txt`, propagate resolutions, etc.)

### 3. User annotation (BUILD)

User opens the proposal and adds `A:` lines inline under each Qn / Rn they want
to resolve. Silence = "accepted as residual risk, revisit later."

### 4. Agent closeout (TEST + RELEASE)

When the user signals approval (even as terse as "all answered"):

1. **Read §8 verbatim** before editing — do not trust summary memory for
   resolutions (users answer inline with context that matters)
2. Propagate each A: answer to its proper home:
   - Documentation advisories → SKILL.md Hard Rules
   - Automated checks → preflight scripts
   - New defaults → config or shared cores
3. Fix any drift the resolutions reveal (if A2 says "add a parity check", the
   check will almost always fail on its first run — that is the point)
4. Tick remaining `[ ]` boxes and stamp status: `APPROVED <date>`
5. Ask the user the final yes/no questions flagged in §9 (e.g. rename working
   notes file?)

### 5. Archive (IMPROVE)

Move approved proposals to `master-wiki/decisions/change-proposals/` and rename
the working notes to `.superseded.txt`. These become reference examples for
future proposals.

## Hard Rules

1. **Plain text, not markdown.** Users annotate inline; markdown rendering
   hides the annotations in preview.
2. **Never summarize the user's answers — read them verbatim.** Compaction and
   summaries drop nuance that the user explicitly typed.
3. **The parity check you add will catch real drift.** Expect it. Fix it in
   the same closeout.
4. **Silence is acceptance, not consent to change behavior.** If a risk has no
   `A:` line, accept it as residual and note it in the approval stamp.
5. **One proposal, one approval.** Do not stack multiple approvals in the same
   document — new change, new file.

## Reference Examples

See `master-wiki/decisions/change-proposals/` for worked examples:

- `brain-upgrade-v8.3/` — trifecta refactor with shared core + TS mirror +
  version-stamp migration (2026-04-23)

### Worked Example: brain-upgrade v8.3.1 (DP5)

This refactor touched 3 executors (`upgrade-brain.cjs`, `bootstrap.ts`, `brain-upgrade.cjs`),
a shared core module (`brain-upgrade-core.cjs`), and the brain-upgrade trifecta itself.
It demonstrates the full propose-change loop in action.

**Phase 1 — Working notes** (`WORKING-NOTES.txt`):
Raw thinking about the problem: three executors duplicated the same copy/backup/restore
logic. Each had its own bugs. The shared core idea emerged, plus the realization that
the trifecta must protect itself (old backups cannot overwrite the new skill).

**Phase 2 — Proposal** (`PROPOSED.txt`):
Structured as: Summary → 5 numbered phases (extract core → wire executors → protect
trifecta → fleet testing → documentation) → contract/invariants (BRAIN_SUBDIRS parity,
exit codes, `.backup.md` convention) → critical thinking section with:
- Q1: "Should bootstrap.ts duplicate or import the CJS core?" → A: duplicate with
  parity preflight check (cross-language import is fragile)
- Q2: "What if upgrade fails mid-copy?" → A: atomic swap via staging directory
- R1: "TS mirror drifts silently from CJS" → Mitigated by `release-preflight.cjs`
  parity check that fails the build
- Falsifiability: "If fleet tests pass but a real heir upgrade corrupts `.github/`,
  the staging-directory approach is wrong"
- Approval checklist: 6 items covering each phase + test green + docs updated

**Phase 3 — User annotation**:
User added `A:` lines under Q1 and Q2. Silence on R1 = accepted residual risk.

**Phase 4 — Closeout**:
Agent propagated answers: Q1 answer → documented in SKILL.md Hard Rules; parity
check added to `release-preflight.cjs` (which indeed caught drift on first run).
Q2 answer → staging directory pattern added to `brain-upgrade-core.cjs`.
Approval stamp: `APPROVED 2026-04-23`.

**Phase 5 — Archive**:
Working notes renamed to `.superseded.txt`. Proposal stays as reference. Both
live in `master-wiki/decisions/change-proposals/brain-upgrade-v8.3/`.

**Key lessons captured in `learned-patterns.instructions.md`**:
- "Report → Validate → Approve loop for non-trivial refactors"
- "Mechanical vs semantic split in trifectas — both need critical thinking"
- "The parity checks you add during closeout will catch real drift — that is the point"

## Template

Start new proposals from:

```text
master-wiki/decisions/change-proposals/TEMPLATE.txt
```
