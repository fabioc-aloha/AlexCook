---
mode: agent
description: "Assess project against Microsoft Responsible AI principles"
application: "Evaluate fairness, reliability, safety, privacy, inclusiveness, transparency, accountability"
tools: ["codebase", "terminal", "editFiles"]
---

Assess this project for Responsible AI principles.

## Microsoft Responsible AI Principles

Evaluate the project against these 6 principles:

### 1. Fairness

- Does the AI treat all users equitably?
- Are there potential biases in training data or outputs?
- Could certain groups be disadvantaged?

### 2. Reliability & Safety

- Does the AI behave predictably?
- Are there guardrails against harmful outputs?
- What happens when the AI fails?

### 3. Privacy & Security

- Is user data protected?
- Is data minimization practiced?
- Are there proper consent mechanisms?

### 4. Inclusiveness

- Is the AI accessible to users with disabilities?
- Does it work across languages and cultures?
- Are diverse perspectives represented?

### 5. Transparency

- Can users understand how the AI works?
- Are AI-generated outputs clearly labeled?
- Is there documentation of limitations?

### 6. Accountability

- Who is responsible when things go wrong?
- Is there human oversight?
- Are there feedback mechanisms?

## Assessment

For each principle, assess:

- 🟢 Addressed — controls in place
- 🟡 Partial — some gaps
- 🔴 Missing — needs attention
- ⚪ N/A — not applicable to this project

## Report

```text
RESPONSIBLE AI ASSESSMENT
=========================
Fairness:        🟢/🟡/🔴/⚪ — [notes]
Reliability:     🟢/🟡/🔴/⚪ — [notes]
Privacy:         🟢/🟡/🔴/⚪ — [notes]
Inclusiveness:   🟢/🟡/🔴/⚪ — [notes]
Transparency:    🟢/🟡/🔴/⚪ — [notes]
Accountability:  🟢/🟡/🔴/⚪ — [notes]

PRIORITY ACTIONS:
1. [highest priority gap]
2. [second priority]
3. [third priority]

DOCUMENTATION NEEDED:
- [ ] AI transparency statement
- [ ] Data handling policy
- [ ] Human oversight procedures
```

Start by identifying AI components in this project.
