---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "AFCP artifact lifecycle — confirmation, supersession, provenance, and event logging for knowledge management"
application: "When creating, updating, or retiring knowledge artifacts in config/knowledge-artifacts.json"
applyTo: "**/*artifact*,**/*knowledge*,**/*insight*"
currency: 2026-04-20
---

# AFCP Artifact Management

Behavioral rules for managing knowledge artifacts through their lifecycle.

## Storage

Artifacts live in `.github/config/knowledge-artifacts.json` (100-entry rolling store).

## Confirmation (AF1)

When you discover an insight that already exists as an artifact:

1. Search existing artifacts by topic and tags before creating a new entry
2. If a match exists, increment `confidence` by 0.1 (cap at 1.0)
3. Add your agent name to `confirmedBy` array
4. Update `lastConfirmedAt` timestamp
5. Do NOT create a duplicate entry

Match criteria: same topic AND semantically equivalent insight (not just keyword overlap).

## Supersession (AF2)

When knowledge becomes outdated:

1. Create the new artifact with updated insight
2. Set `supersededBy` on the old artifact pointing to the new artifact's ID
3. Do NOT delete the old artifact — it preserves history
4. Old artifacts with `supersededBy` set are deprioritized in searches but remain for provenance

Chain rule: if artifact A supersedes B which superseded C, the chain is traceable.

## Provenance (AF4)

Every artifact must include:

| Field | Required | Content |
|-------|----------|---------|
| `assertedBy` | Yes | Agent name that created the artifact |
| `confirmedBy` | No | Array of agent names that independently confirmed it |
| `evidence` | No | References only — file paths, line numbers, URLs. Never raw code or user quotes |
| `correlationId` | No | Links to the request chain that produced it |

Privacy rule: `evidence` field must contain references (e.g., `src/module.ts:42`), not inline code snippets or user-provided content.

## Context Promotion (AF3)

Session learnings should be promoted to persistent memory when durable:

1. During meditation or session wrap-up, review session memory (`/memories/session/`)
2. If an insight was useful across 2+ exchanges in the session, promote to:
   - User memory (`/memories/`) for workflow preferences
   - Repo memory (`/memories/repo/`) for codebase facts
   - Knowledge artifacts for cross-project patterns
3. Strip PII before promotion (per `pii-memory-filter.instructions.md`)

## Event Logging (AF6)

State changes on artifacts are logged to `.github/quality/assignment-log.json`:

| Event | Trigger | Logged Fields |
|-------|---------|---------------|
| `artifact:created` | New artifact | id, topic, assertedBy, confidence |
| `artifact:confirmed` | Existing match found | id, confirmedBy, newConfidence |
| `artifact:superseded` | Knowledge updated | oldId, newId, reason |
| `artifact:pruned` | Meditation cleanup | id, age, confidence at pruning |

## Extended Schema

```json
{
  "id": "ka-NNN",
  "topic": "string",
  "insight": "string",
  "confidence": 0.5,
  "assertedBy": "agent-name",
  "confirmedBy": ["agent-name"],
  "evidence": ["file:line", "url"],
  "source": "session | meditation | agent",
  "createdAt": "ISO 8601",
  "lastConfirmedAt": "ISO 8601 | null",
  "supersededBy": "ka-NNN | null",
  "correlationId": "req-hex | null",
  "tags": ["string"]
}
```
