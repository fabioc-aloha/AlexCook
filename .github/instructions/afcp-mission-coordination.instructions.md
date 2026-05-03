---
type: instruction
lifecycle: stable
inheritance: inheritable
description: "AFCP mission coordination — unknown consultation, delegation tracking, and mission lifecycle for multi-agent work"
application: "When routing tasks to subagents, handling unknowns, or managing multi-step missions"
applyTo: "**/*mission*,**/*delegate*,**/*unknown*,**/*subagent*"
currency: 2026-04-20
---

# AFCP Mission Coordination

Behavioral rules for coordinating multi-agent work through missions, unknowns, and delegation chains.

## Unknown Consultation Routing (AF5)

When you encounter uncertainty that blocks progress:

1. Classify the unknown into one of 5 categories:
   - **Information**: Missing facts needed to proceed
   - **Interpretation**: Ambiguous requirement or conflicting signals
   - **Decision**: Multiple valid approaches, user judgment needed
   - **Authority**: Action requires user permission
   - **Capability**: Task exceeds current skill set

2. Route based on category:
   - Information → Alex-Researcher agent (deep search)
   - Interpretation → Critical Thinker agent (structured analysis)
   - Decision → Ask user via `vscode_askQuestions`
   - Authority → Ask user (never assume permission)
   - Capability → Acknowledge limitation honestly

3. Log to `.github/config/unknowns.json` (50-entry rolling):
   ```json
   {
     "id": "unk-NNN",
     "category": "information",
     "description": "brief question",
     "severity": "low|medium|high",
     "state": "open|consulting|resolved|deferred",
     "openedBy": "agent-name",
     "resolvedBy": "agent-name | user",
     "resolution": "brief answer"
   }
   ```

4. Transition states: Open → Consulting (routed to specialist) → Resolved (answer found) or Deferred (parked for later)

## Delegation Chain Tracking (AF7)

When delegating work to subagents:

1. Propagate the correlation ID from parent to child: `req-{hex}.{agent}.{operation}`
2. Each hop appends its agent name to the chain
3. The `subagent-context.cjs` hook (H16) injects context automatically
4. The `subagent-stop.cjs` hook (H17) logs the outcome

Chain example:
```
req-a1b2c3                         # User request
req-a1b2c3.Planner.decompose       # Planner breaks down task
req-a1b2c3.Builder.implement       # Builder codes solution
req-a1b2c3.Validator.review        # Validator checks output
```

Visibility rule: when reporting results to the user, mention which agents contributed if 2+ agents were involved.

## Mission Lifecycle (AF8)

Complex tasks (3+ steps, multiple agents) follow a formal lifecycle:

| State | Entry Condition | Exit Condition |
|-------|----------------|----------------|
| **Start** | User requests complex task | Plan created, agents identified |
| **Working** | First agent begins execution | All agents complete or blocked |
| **Blocked** | Unknown opened, awaiting resolution | Unknown resolved or deferred |
| **Complete** | All deliverables produced | User confirms or auto-close |
| **Failed** | Unrecoverable error | User notified with diagnosis |

Rules:
- Use `manage_todo_list` to track mission state visibly
- A mission in Working state should have exactly one in-progress todo
- Blocked missions surface the blocking unknown to the user
- Failed missions include root cause, not just the error message
- Missions auto-close after final todo is marked complete

## Integration Points

| Component | Role |
|-----------|------|
| `config/unknowns.json` | Unknown store (AF5) |
| `config/correlation-vector.json` | Request chain tracking (AF7) |
| `quality/assignment-log.json` | Delegation outcomes (AF7, AF8) |
| `hooks/subagent-context.cjs` | H16 — injects correlation context |
| `hooks/subagent-stop.cjs` | H17 — logs assignment outcomes |
| `muscles/analyze-assignments.cjs` | Meditation-time analysis |
